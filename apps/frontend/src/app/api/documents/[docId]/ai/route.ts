import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  const { docId } = await params;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, operation } = await req.json();

    if (!text || !operation) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const systemPrompts: Record<string, string> = {
      enhance: "You are a helpful writing assistant. Improve the grammar, clarity, and style of the text while maintaining the original meaning. Return only the improved text without any additional commentary.",
      expand: "You are a helpful writing assistant. Expand on the given text with more details, examples, and context. Return only the expanded text without any additional commentary.",
      summarize: "You are a helpful writing assistant. Create a concise summary of the text. Return only the summary without any additional commentary.",
      simplify: "You are a helpful writing assistant. Simplify the text to make it easier to understand. Return only the simplified text without any additional commentary.",
      professional: "You are a helpful writing assistant. Rewrite the text in a more professional tone. Return only the rewritten text without any additional commentary.",
      casual: "You are a helpful writing assistant. Rewrite the text in a more casual, friendly tone. Return only the rewritten text without any additional commentary.",
    };

    const systemPrompt = systemPrompts[operation] || systemPrompts.enhance;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const result = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ result });
  } catch (error) {
    console.error("AI enhancement error:", error);
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 }
    );
  }
}
