import { z } from 'zod'
import { auth } from '@/lib/auth'
import { parseFile } from '@/entities/chats/utils/fileParser'

export const maxDuration = 60

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(req: Request): Promise<Response> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const conversationId = formData.get('conversationId') as string

    if (!file) {
      return new Response('No file provided', { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return new Response('File too large', { status: 400 })
    }

    if (!conversationId) {
      return new Response('Conversation ID required', { status: 400 })
    }

    const parsedFile = await parseFile(file, session.user.id, conversationId)

    return new Response(JSON.stringify(parsedFile), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('File upload error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to upload file' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

