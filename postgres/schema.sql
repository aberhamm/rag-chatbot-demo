-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE content_chunks (
  id         bigserial PRIMARY KEY,
  content    text,
  embedding  vector(1536),      -- OpenAI text‑embedding‑3‑small
  source     text,              -- optional file name, URL, etc.
  added_at   timestamptz DEFAULT now()
);

-- High‑recall ANN index for cosine similarity
-- Note: Adding index before inserting data slows down the insert process

CREATE INDEX ON content_chunks
USING hnsw (embedding vector_cosine_ops);
