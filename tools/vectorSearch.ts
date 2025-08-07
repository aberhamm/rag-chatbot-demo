// ============================================================================
// VECTOR SEARCH TOOL - The Heart of RAG (Retrieval-Augmented Generation)
// ============================================================================
//
// This file implements the core vector search functionality that powers our
// RAG chatbot. It demonstrates several key concepts:
//
// 1. VECTOR EMBEDDINGS
// 2. SEMANTIC SIMILARITY
// 3. TOOL CALLING
// 4. VECTOR DATABASES
//
// The process: User Question → Embed Query → Search Vectors → Return Context
// ============================================================================

import { embed, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { Pool } from 'pg';

// Database connection with pgvector support
const db = new Pool({ connectionString: process.env.DATABASE_URL });

// Tool definition for LLM auto-calling
export const vectorSearchTool = tool({
  description: 'Search for relevant information in the knowledge base',
  parameters: z.object({
    query: z.string().describe('The search query to find relevant information'),
  }),
  execute: async ({ query }) => {
    console.log('🔍 Vector Search Tool Called with query:', query);

    console.log('📊 Converting query to 1536-dimensional vector...');
    // Convert query to 1536-dimensional vector using same model as data
    const { embedding: qVec } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: query,
    });

    // Convert vector array to PostgreSQL vector format
    // PostgreSQL expects vectors as strings like '[0.1, 0.2, 0.3, ...]'
    const qVecString = `[${qVec.join(',')}]`;
    console.log(`✅ Query embedded as vector with ${qVec.length} dimensions`);

    console.log('🎯 Searching for semantically similar content...');
    // Search for most similar content using cosine distance
    const { rows } = await db.query<{ content: string; source: string }>(
      `SELECT content, source
        FROM content_chunks
        ORDER BY embedding <=> $1
        LIMIT 5`,
      [qVecString]
    );

    console.log(`📄 Found ${rows.length} relevant content chunks`);

    // Format results for LLM consumption
    const results = rows.map((r, i) => ({
      content: r.content,
      source: r.source,
      rank: i + 1,
    }));

    console.log('🔄 Returning context to LLM for answer generation');
    return { results };
  },
});

// ============================================================================
// KEY CONCEPTS DEMONSTRATED:
//
// 1. EMBEDDINGS: Text → High-dimensional vectors that capture meaning
// 2. VECTOR SIMILARITY: Finding related content by vector distance
// 3. SEMANTIC SEARCH: "car maintenance" matches "vehicle care"
// 4. RAG PATTERN: Retrieve relevant context, then generate answer
// 5. TOOL CALLING: LLM autonomously decides when to search
// 6. PRODUCTION SCALE: PostgreSQL + pgvector handles millions of vectors
//
// This approach is vastly superior to keyword search because it understands
// meaning and context, not just exact word matches.
// ============================================================================
