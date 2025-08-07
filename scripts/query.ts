// ============================================================================
// VECTOR SIMILARITY QUERY SCRIPT - Standalone Search Testing Tool
// ============================================================================
//
// This script demonstrates pure vector search without LLM integration.
// It's perfect for understanding and testing the core similarity concepts:
//
// 1. QUERY EMBEDDING: Converting search terms to vectors
// 2. COSINE SIMILARITY: Mathematical measurement of semantic closeness
// 3. SIMILARITY SCORING: Understanding relevance rankings
// 4. VECTOR INDEXING: How pgvector optimizes search performance
// 5. RESULT RANKING: Interpreting similarity scores for quality assessment
//
// Use this tool to test search quality and tune your embedding strategy
// ============================================================================

import 'dotenv/config'; // Load environment variables
import { Pool } from 'pg'; // PostgreSQL client with pgvector support
import { openai } from '@ai-sdk/openai'; // OpenAI embeddings
import { embed } from 'ai'; // AI SDK embedding function

// Database connection and search configuration
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const TOP_N = 5; // Number of most similar chunks to retrieve

// ============================================================================
// MAIN QUERY FUNCTION - DEMONSTRATES VECTOR SIMILARITY SEARCH
// ============================================================================
/**
 * Performs semantic search against the vector database.
 *
 * This function showcases the complete vector search pipeline:
 * 1. Embed the search query into the same vector space as stored content
 * 2. Use cosine similarity to find semantically related content
 * 3. Return ranked results with similarity scores for analysis
 *
 * @param query - The search query string
 */
async function query(query: string) {
  console.log('\n🔍 VECTOR SIMILARITY SEARCH DEMO');
  console.log('=====================================');
  console.log(`📝 Query: "${query}"`);

  // Convert query to vector using same model as knowledge base
  console.log('\n🧠 Converting query to 1536-dimensional vector...');
  const { embedding: qVec } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: query,
  });

  const qVecString = `[${qVec.join(',')}]`;
  console.log(`✅ Query embedded: ${qVec.length} dimensions`);

  // Search for most similar content using cosine distance
  console.log(`\n🎯 Searching for top ${TOP_N} most similar content chunks...`);
  console.log('📊 Using cosine distance for similarity measurement');

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

  // Display results with similarity scores
  console.log(`\n📋 SEARCH RESULTS (${rows.length} matches found):`);
  console.log('================================================');

  if (rows.length === 0) {
    console.log('❌ No matches found. Consider:');
    console.log('   - Adding more diverse content to knowledge base');
    console.log('   - Using broader search terms');
    console.log('   - Checking if database contains relevant information');
    await pool.end();
    return;
  }

  rows.forEach((row, i) => {
    const rank = i + 1;
    const scorePercentage = (row.score * 100).toFixed(1);

    console.log(`\n🏆 RANK #${rank}`);
    console.log(`📈 Similarity Score: ${row.score.toFixed(4)} (${scorePercentage}% match)`);
    console.log(`📁 Source: ${row.source}`);
    console.log(`📄 Content: "${row.content}"`);
    console.log('─'.repeat(80));
  });

  // Provide search quality analysis
  const topScore = rows[0]?.score || 0;
  console.log(`\n📊 SEARCH QUALITY ANALYSIS:`);
  console.log(`   🥇 Best match score: ${(topScore * 100).toFixed(1)}%`);

  if (topScore > 0.8) {
    console.log('   ✅ Excellent match quality - highly relevant results');
  } else if (topScore > 0.6) {
    console.log('   👍 Good match quality - relevant results found');
  } else if (topScore > 0.4) {
    console.log('   ⚠️  Moderate match quality - results may be loosely related');
  } else {
    console.log('   ❓ Low match quality - consider refining query or adding more content');
  }

  await pool.end();
  console.log('\n🔍 Vector search demo complete!');
}

// ============================================================================
// SCRIPT EXECUTION - COMMAND LINE INTERFACE FOR TESTING
// ============================================================================

/**
 * Command-line interface for testing vector similarity search.
 *
 * Usage examples:
 * - npx tsx scripts/query.ts "How do I return a product?"
 * - npx tsx scripts/query.ts "What's your refund policy?"
 * - npx tsx scripts/query.ts "Customer service hours"
 */
(async () => {
  try {
    // Get query from command line or use default
    const searchQuery = process.argv[2] || 'How can I change my billing information?';

    if (process.argv[2]) {
      console.log('🎯 Running custom query from command line arguments');
    } else {
      console.log('📝 No query provided, using default example');
      console.log('💡 Tip: Run with custom query like: npx tsx scripts/query.ts "your question here"');
    }

    await query(searchQuery);

  } catch (err) {
    console.error('\n💥 Error during vector search:', err);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Ensure database is running (docker ps)');
    console.log('- Verify DATABASE_URL environment variable');
    console.log('- Check that content has been embedded (run embed script first)');
    console.log('- Confirm OPENAI_API_KEY is valid');
    process.exit(1);
  }
})();

// ============================================================================
// UNDERSTANDING VECTOR SIMILARITY SCORES:
//
// COSINE SIMILARITY RANGES:
// - 1.0 = Identical vectors (perfect semantic match)
// - 0.8-0.99 = Very high similarity (excellent matches)
// - 0.6-0.79 = High similarity (good matches)
// - 0.4-0.59 = Moderate similarity (loosely related)
// - 0.2-0.39 = Low similarity (weakly related)
// - 0.0-0.19 = Very low similarity (likely unrelated)
//
// PRACTICAL THRESHOLDS:
// - 0.8+ : Use for precise answers, high confidence
// - 0.6+ : Use for general responses, moderate confidence
// - 0.4+ : Use for suggestions, low confidence
// - <0.4 : Consider "no relevant information found"
//
// This tool helps you understand what similarity scores mean for your
// specific dataset and tune your RAG system's confidence thresholds.
// ============================================================================
