import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextRequest } from 'next/server';
import { vectorSearchTool } from '@/tools/vectorSearch';

export const POST = async (req: NextRequest) => {
  const { messages } = await req.json();

  const systemMsg = {
    role: 'system',
    content: `You are a helpful support assistant.
    When users ask questions, use the vector search tool to find relevant information from the knowledge base.
    Base your answers on the search results.
    Always provide a response after using the tool.
    If the user asks a question that is not related to the knowledge base, say that you are not sure about the answer.`,
  };

  try {
    // Stream GPT-4's response with tool calling
    const result = streamText({
      model: openai('gpt-4.1'),
      messages: [systemMsg, ...messages],
      tools: {
        vectorSearch: vectorSearchTool,
      },
      maxSteps: 5, // Allow multiple tool calls and responses
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
