// scripts/embed.ts
import 'dotenv/config'; // load .env into process.env
import fs from 'node:fs'; // read files
import path from 'node:path'; // build file paths
import { Pool } from 'pg'; // Postgres client
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { openai } from '@ai-sdk/openai'; // OpenAI adapter
import { embedMany } from 'ai'; // generic AI interface

const BATCH_SIZE = 50;
const MAX_CHUNK_LENGTH = 512; // max characters per chunk
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Ingest a plain-text Q&A file where each line is either a question or an answer.
 * Splits on single newlines; if a line exceeds MAX_CHUNK_LENGTH, it is further
 * chunked by RecursiveCharacterTextSplitter.
 */
async function ingest(file: string) {
  const raw = fs.readFileSync(file, 'utf8');
  console.log(`Loaded ${file}`);

  // Split into lines, drop empty lines
  const lines = raw
    .split(/\r?\n\s*\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Prepare overflow splitter for any long lines
  const overflowSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: MAX_CHUNK_LENGTH,
    chunkOverlap: 50,
  });

  // Build final list of chunks
  const chunks: string[] = [];
  for (const line of lines) {
    if (line.length <= MAX_CHUNK_LENGTH) {
      chunks.push(line);
    } else {
      // Further split long lines into smaller chunks if needed
      const sub = await overflowSplitter.splitText(line);
      chunks.push(...sub);
    }
  }

  console.log(`Processing ${chunks.length} chunks in batches of ${BATCH_SIZE}`);

  // Process chunks in batches using embedMany
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)}`);

    // Embed the entire batch at once
    const { embeddings } = await embedMany({
      model: openai.embedding('text-embedding-3-small'),
      values: batch,
    });

    // Insert all embeddings from this batch into the database
    for (let j = 0; j < batch.length; j++) {
      const chunk = batch[j];
      const embedding = embeddings[j];
      const vectorString = `[${embedding.join(',')}]`;

      console.log(`Inserting chunk ${i + j + 1}/${chunks.length}: ${chunk.slice(0, 60)}...`);
      await pool.query('INSERT INTO content_chunks (content, embedding, source) VALUES ($1,$2,$3)', [chunk, vectorString, path.basename(file)]);
    }
  }
}

async function main() {
  console.log('Starting embedding ingestion…');
  await ingest('./input/data.txt');
  await pool.end();
}

main().catch((err) => {
  console.error('Ingestion error:', err);
  process.exit(1);
});
