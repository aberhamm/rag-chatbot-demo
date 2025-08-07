// ============================================================================
// CHAT API ROUTE - RAG (Retrieval-Augmented Generation) Implementation
// ============================================================================
//
// This is the main API endpoint that powers our RAG chatbot. It demonstrates
// the complete RAG workflow and several advanced AI concepts:
//
// 1. TOOL CALLING: LLM autonomously decides when to search knowledge base
// 2. RAG PATTERN: Retrieve → Augment → Generate enhanced responses
// 3. STREAMING: Real-time response generation for better user experience
// 4. SYSTEM PROMPTS: Guiding LLM behavior and response quality
// 5. MULTI-STEP REASONING: LLM can make multiple tool calls if needed
//
// Flow: User Message → LLM Analysis → Tool Call → Context Retrieval → Final Answer
// ============================================================================

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextRequest } from 'next/server';
import { vectorSearchTool } from '@/tools/vectorSearch';

export const POST = async (req: NextRequest) => {
  // Extract conversation history for context-aware responses
  const { messages } = await req.json();

  // System message instructs LLM on tool usage and response style
  const systemMsg = {
    role: 'system',
    content: `You are a helpful support assistant with access to a knowledge base.

INSTRUCTIONS:
1. When users ask questions, use the vector search tool to find relevant information
2. Base your answers primarily on the search results you retrieve
3. If search results are relevant, incorporate them naturally into your response
4. If no relevant information is found, politely explain what you can't answer
5. Always provide a helpful response after using the search tool
6. Cite information sources when appropriate

Be conversational but accurate. Use the retrieved context to provide detailed, helpful answers.`,
  };

  try {
    console.log('💬 Processing chat request with RAG capabilities...');

    const result = streamText({
      model: openai('gpt-4.1'),
      messages: [systemMsg, ...messages],
      tools: {
        vectorSearch: vectorSearchTool, // Enable semantic search
      },
      maxSteps: 5, // Allow multiple tool calls for complex reasoning
    });

    console.log('✅ RAG pipeline initiated, streaming response...');
    return result.toDataStreamResponse(); // Stream response in real-time

  } catch (error) {
    console.error('❌ Error in chat API:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

// ============================================================================
// RAG WORKFLOW EXPLAINED:
//
// 1. USER ASKS QUESTION: "How do I return a product?"
//
// 2. LLM ANALYSIS: GPT-4 analyzes the question and determines it needs
//    external knowledge about return policies
//
// 3. TOOL CALLING: LLM automatically calls vectorSearch("product return policy")
//
// 4. VECTOR SEARCH: Tool embeds the query and finds relevant chunks about returns
//
// 5. CONTEXT INJECTION: Search results are provided back to the LLM as context
//
// 6. ENHANCED GENERATION: LLM generates response using both its training
//    and the retrieved context for accurate, up-to-date information
//
// 7. STREAMING RESPONSE: Answer streams back to user in real-time
//
// This approach combines the reasoning power of large language models with
// the accuracy and recency of your specific knowledge base.
// ============================================================================
