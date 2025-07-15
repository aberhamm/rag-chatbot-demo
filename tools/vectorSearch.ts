import { embed, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { Pool } from 'pg';

const db = new Pool({ connectionString: process.env.DATABASE_URL });

// Define the vector search tool
export const vectorSearchTool = tool({
  description: 'Search for relevant information in the knowledge base',
  parameters: z.object({
    query: z.string().describe('The search query to find relevant information'),
  }),
  execute: async ({ query }) => {
    console.log('Searching for:', query);

    // Embed the search query
    const { embedding: qVec } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: query,
    });

    const qVecString = `[${qVec.join(',')}]`;

    // Retrieve top-5 most similar chunks
    const { rows } = await db.query<{ content: string; source: string }>(
      `SELECT content, source
         FROM content_chunks
     ORDER BY embedding <=> $1
        LIMIT 5`,
      [qVecString]
    );

    const results = rows.map((r, i) => ({
      content: r.content,
      source: r.source,
      rank: i + 1,
    }));

    return { results };
  },
});
