/* scripts/query.ts */

import 'dotenv/config';
import { Pool } from 'pg';
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const TOP_N = 5; // number of chunks to retrieve

async function query(query: string) {
  console.log(`Embedding query: "${query}"`);
  const { embedding: qVec } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: query,
  });
  const qVecString = `[${qVec.join(',')}]`;

  console.log(`Fetching top ${TOP_N} similar chunks from database...`);
  const { rows } = await pool.query<{
    content: string;
    source: string;
    score: number;
  }>(
    `SELECT content, source,
            1 - (embedding <=> $1) AS score
       FROM content_chunks
   ORDER BY embedding <=> $1
      LIMIT $2`,
    [qVecString, TOP_N]
  );

  console.log('Results:');
  rows.forEach((row, i) => {
    console.log(`
#${i + 1} (score: ${row.score.toFixed(3)}, source: ${row.source})`);
    console.log(row.content);
  });

  await pool.end();
}

(async () => {
  try {
    await query('How can I change my billing information?');
  } catch (err) {
    console.error('Error testing retrieval:', err);
  }
})();
