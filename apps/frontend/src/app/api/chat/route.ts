import { z } from 'zod'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { initializeOpenAI } from '@/lib/openai'
import { supabaseAdmin } from '@/lib/supabase/client'
import { setJson } from '@/lib/redis'
import {
  OpenAIErrorHandler,
  checkRateLimit,
  ensureChatContext,
  getChatContextKey,
  CHAT_CONTEXT_TTL_SECONDS,
  countTokens,
  convertModelName,
  type ChatContextType,
} from '@/entities/chats/utils'
import { UsageManager } from '@/features/usage/utils/usageManager'

const textEncoder = new TextEncoder()

// Using Node.js runtime for Prisma Client compatibility
// Edge runtime doesn't support Prisma Client or Node.js modules like 'stream'
// export const runtime = 'edge' // Disabled - Prisma requires Node.js runtime
export const maxDuration = 60

const bodySchema = z.object({
  conversationId: z.string(),
  contextType: z.enum(['project', 'profile', 'proposal', 'team', 'workspace', 'space', 'channel']),
  entityId: z.string(),
  message: z.string().min(1),
  attachments: z.array(z.object({
    url: z.string(),
    filename: z.string(),
    mimeType: z.string(),
    type: z.enum(['text', 'file']),
    fileId: z.string().optional(),
    content: z.string().optional(),
    chunks: z.array(z.string()).optional(),
    embeddings: z.array(z.object({
      chunk: z.string(),
      embedding: z.array(z.number()),
    })).optional(),
  })).optional(),
  webSearch: z.boolean().optional(),
  model: z.string().optional(),
  config: z
    .object({
      RPM: z.number().optional(),
      RPD: z.number().optional(),
    })
    .optional(),
})

interface ChatCompletionMessageParam {
  role: 'system' | 'user' | 'assistant'
  content: string | Array<{ type: string; text?: string; file_id?: string }>
}

/**
 * Build user message content with attachments
 */
function buildUserMessageContent(
  message: string,
  attachments?: Array<{
    url: string
    filename: string
    mimeType: string
    type: 'text' | 'file'
    fileId?: string
    content?: string
    chunks?: string[]
    embeddings?: Array<{ chunk: string; embedding: number[] }>
  }>
): string | Array<{ type: string; text?: string; file_id?: string }> {
  if (!attachments || attachments.length === 0) {
    return message
  }

  const content: Array<{ type: string; text?: string; file_id?: string }> = [
    { type: 'input_text', text: message },
  ]

  for (const attachment of attachments) {
    if (attachment.type === 'text' && attachment.content) {
      // Include text content directly
      content.push({
        type: 'input_text',
        text: `\n\nFile: ${attachment.filename}\n${attachment.content}`,
      })
    } else if (attachment.fileId) {
      // Use OpenAI file ID
      content.push({
        type: 'input_file',
        file_id: attachment.fileId,
      })
    }
  }

  return content
}

export async function POST(req: Request): Promise<Response> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const payload = await req.json()
    const { conversationId, contextType, entityId, message, attachments, webSearch, model, config } = bodySchema.parse(payload)

    const openai = initializeOpenAI()
    const db = prisma as any

    // **OPTIMIZATION 1: Parallel execution of independent operations**
    const [rateLimitResult, conversation] = await Promise.all([
      checkRateLimit(req, config ?? {}),
      db.aiConversation.findFirst({
        where: {
          id: conversationId,
          userId: session.user.id,
        },
        include: {
          model: true,
        },
      }),
    ])

    const modelName = convertModelName(conversation.model?.name) ?? 'gpt-4o-mini'

    if (rateLimitResult instanceof Response) {
      return rateLimitResult
    }

    if (!conversation) {
      return new Response('Conversation not found', { status: 404 })
    }

    // Validate conversation belongs to the entity
    const entityField = contextType === 'project' ? 'projectId' : contextType === 'proposal' ? 'proposalId' : contextType === 'team' ? 'teamId' : null
    if (entityField && conversation[entityField] && conversation[entityField] !== entityId) {
      return new Response(`Conversation does not belong to this ${contextType}`, { status: 400 })
    }

    // **OPTIMIZATION 2: Parallel execution of context, embedding, previous messages, and knowledge retrieval**
    const [context, queryEmbedding, previousMessages] = await Promise.all([
      ensureChatContext(conversationId, contextType as ChatContextType, entityId, openai),
      openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: message,
      }),
      db.aiMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        take: 30,
        select: {
          role: true,
          content: true,
          // Only select fields we need
        },
      }),
    ])
    
    // **OPTIMIZATION 3: Knowledge retrieval after embedding is ready**
    let knowledgeSnippets: string[] = []
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_URL && contextType === 'project') {
      try {
        const { data, error } = await supabaseAdmin.rpc('match_entity_data', {
          query_embedding: queryEmbedding.data[0]?.embedding,
          match_threshold: 0.7,
          match_count: 5,
          project_id: entityId,
        })

        if (!error && Array.isArray(data)) {
          knowledgeSnippets = data
            .map((row: any) => row?.content || row?.metadata?.content)
            .filter((item: unknown): item is string => typeof item === 'string')
        }
      } catch (error) {
        console.warn('Failed to execute Supabase match_entity_data RPC', error)
      }
    }

    // Web search if enabled
    let webSearchOptions: any = undefined
    if (webSearch) {
      webSearchOptions = {
        search_context_size: 'low',
        user_location: {
          approximate: {
            city: 'city',
            country: 'country',
            region: 'region',
            timezone: 'timezone',
          },
          type: 'approximate',
        },
      }
      knowledgeSnippets.push('[Web search enabled - results will be included in response]')
    }

    const contextLabels: Record<ChatContextType, string> = {
      project: 'project',
      profile: 'profile',
      proposal: 'proposal',
      team: 'team',
      workspace: 'workspace',
      space: 'space',
      channel: 'channel',
    }

    const systemPromptParts = [
      conversation.systemPrompt ||
        `You are an AI assistant that helps users manage their ${contextLabels[contextType as ChatContextType]} inside the Xovira platform. Provide actionable, concise answers and reference ${contextLabels[contextType as ChatContextType]} knowledge when possible.`,
    ]

    if (context.summary) {
      systemPromptParts.push(`${contextLabels[contextType as ChatContextType].charAt(0).toUpperCase() + contextLabels[contextType as ChatContextType].slice(1)} summary:\n${context.summary}`)
    }

    if (knowledgeSnippets.length > 0) {
      systemPromptParts.push(
        `Relevant ${contextLabels[contextType as ChatContextType]} context:\n${knowledgeSnippets
          .map((snippet, index) => `${index + 1}. ${snippet}`)
          .join('\n')}`
      )
    }

    // Build input messages
    const inputMessages = [
      {
        role: 'system',
        content: systemPromptParts.join('\n\n'),
      },
      ...previousMessages.map((msg) => ({
        role: msg.role.toLowerCase() as ChatCompletionMessageParam['role'],
        content: msg.content,
      })),
      {
        role: 'user',
        content: buildUserMessageContent(message, attachments),
      },
    ]

    // **OPTIMIZATION 4: Use approximate token count for pre-check (faster)**
    const estimatedInputTokens = Math.ceil(JSON.stringify(inputMessages).length / 4)

    // Quick token limit check with estimate
    const tokenCheck = await UsageManager.checkTokenLimit(
      session.user.id,
      estimatedInputTokens
    )

    if (!tokenCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Insufficient tokens',
          message: `You have ${tokenCheck.remaining} tokens remaining, but need approximately ${estimatedInputTokens} tokens. Please upgrade your plan or purchase more tokens.`,
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const messages: ChatCompletionMessageParam[] = inputMessages

    // **OPTIMIZATION 5: Save user message and start streaming in parallel**
    // Don't wait for DB operations before starting the stream
    const userMessagePromise = db.$transaction([
      db.aiMessage.create({
        data: {
          conversationId,
          role: 'USER',
          content: message,
          model: conversation.model?.name,
          tokensUsed: estimatedInputTokens, // Use estimate initially
          attachments
        },
      }),
      db.aiConversation.update({
        where: { id: conversationId },
        data: {
          messageCount: { increment: 1 },
          totalTokensUsed: { increment: estimatedInputTokens },
          lastMessageAt: new Date(),
        },
      }),
    ])

    const completionOptions: any = {
      model: modelName,
      stream: true,
      messages,
      temperature: 0.4,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
    }

    if (webSearchOptions) {
      completionOptions.web_search_options = webSearchOptions
    }

    // **OPTIMIZATION 6: Start streaming immediately, process DB in background**
    const completionStream = await openai.chat.completions.create(completionOptions)

    const redisKey = getChatContextKey(conversationId)

    const stream = new ReadableStream({
      async start(controller) {
        let assistantMessage = ''
        let hasStartedStreaming = false

        try {
          // Ensure user message is saved before we start processing
          await userMessagePromise

          // Handle streaming response
          const stream = completionStream as any
          for await (const part of stream) {
            const content = part.choices?.[0]?.delta?.content
            if (!content) continue

            if (!hasStartedStreaming) {
              hasStartedStreaming = true
            }

            assistantMessage += content
            controller.enqueue(textEncoder.encode(content))
          }

          // **OPTIMIZATION 7: Do token counting and DB updates after streaming completes**
          // This happens in the background while user is already receiving the response
          
          // Use fire-and-forget for non-critical updates
          const finalizeResponse = async () => {
            try {
              // Count exact tokens after completion
              const [inputTokenCount, outputTokenCount] = await Promise.all([
                countTokens({
                  input: JSON.stringify(inputMessages),
                  model: modelName,
                }),
                countTokens({
                  completion: assistantMessage,
                  model: modelName,
                }),
              ])

              const totalInputTokens = inputTokenCount.inputTokens || estimatedInputTokens
              const totalOutputTokens = outputTokenCount.outputTokens || 0

              // Parallel execution of final DB operations
              await Promise.all([
                db.$transaction([
                  db.aiMessage.create({
                    data: {
                      conversationId,
                      role: 'ASSISTANT',
                      content: assistantMessage,
                      model: conversation.model?.name,
                      tokensUsed: totalInputTokens + totalOutputTokens,
                    },
                  }),
                  db.aiConversation.update({
                    where: { id: conversationId },
                    data: {
                      messageCount: { increment: 1 },
                      totalTokensUsed: { increment: totalOutputTokens }, // Only add output tokens (input already added)
                      lastMessageAt: new Date(),
                    },
                  }),
                ]),
                // Update usage tracking in parallel
                UsageManager.updateChatUsage(
                  session.user.id,
                  session.user.name || session.user.email || 'User',
                  totalInputTokens,
                  totalOutputTokens,
                  1,
                  session.user.email || undefined
                ).catch(error => {
                  console.error('Failed to update chat token usage:', error)
                }),
                // Update Redis cache in parallel
                setJson(
                  redisKey,
                  {
                    ...context,
                    embedding: queryEmbedding.data[0]?.embedding ?? context.embedding,
                    lastUpdatedAt: Date.now(),
                  },
                  CHAT_CONTEXT_TTL_SECONDS
                ),
              ])
            } catch (error) {
              console.error('Error finalizing response:', error)
            }
          }

          // Don't await - let it run in background
          finalizeResponse()

          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    const headers = new Headers({
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    })

    if (rateLimitResult.limitPerMinute !== undefined) {
      headers.set('X-Rate-Limit-Limit-Minute', rateLimitResult.limitPerMinute.toString())
    }
    if (rateLimitResult.remainingPerMinute !== undefined) {
      headers.set(
        'X-Rate-Limit-Remaining-Minute',
        rateLimitResult.remainingPerMinute.toString()
      )
    }
    if (rateLimitResult.resetPerMinute !== undefined) {
      headers.set('X-Rate-Limit-Reset-Minute', rateLimitResult.resetPerMinute.toString())
    }
    if (rateLimitResult.limitPerDay !== undefined) {
      headers.set('X-Rate-Limit-Limit-Day', rateLimitResult.limitPerDay.toString())
    }
    if (rateLimitResult.remainingPerDay !== undefined) {
      headers.set('X-Rate-Limit-Remaining-Day', rateLimitResult.remainingPerDay.toString())
    }
    if (rateLimitResult.resetPerDay !== undefined) {
      headers.set('X-Rate-Limit-Reset-Day', rateLimitResult.resetPerDay.toString())
    }

    return new Response(stream, { headers })
  } catch (error) {
    return OpenAIErrorHandler.handleOpenAIError(error)
  }
}