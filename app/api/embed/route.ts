// ============================================================================
// EMBED API ROUTE - Real-time Content Addition to Knowledge Base
// ============================================================================
//
// This API endpoint demonstrates how to add individual pieces of content to
// your vector database in real-time. Key concepts covered:
//
// 1. SINGLE-ITEM EMBEDDING: Converting one piece of text to vector format
// 2. INPUT VALIDATION: Ensuring data quality before embedding
// 3. ERROR HANDLING: Comprehensive error management for production use
// 4. IMMEDIATE AVAILABILITY: New content becomes searchable instantly
// 5. COST OPTIMIZATION: Efficient embedding of individual items
//
// This complements batch processing and enables dynamic knowledge base updates
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';
import { Pool } from 'pg';
import { z } from 'zod';

// Database connection with pgvector support
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Input validation to prevent API waste and ensure data quality
const embedRequestSchema = z.object({
  content: z.string()
    .min(1, 'Content cannot be empty')
    .max(10000, 'Content too long (max 10,000 characters)'),
  source: z.string()
    .min(1, 'Source cannot be empty')
    .max(255, 'Source too long (max 255 characters)'),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate input data
    const body = await req.json();
    console.log('📝 Validating input data...');
    const validation = embedRequestSchema.safeParse(body);

    if (!validation.success) {
      console.log('❌ Validation failed:', validation.error.errors);
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    const { content, source } = validation.data;
    console.log(`✅ Input validated - Content: ${content.length} chars, Source: ${source}`);

    // Check environment variables
    if (!process.env.DATABASE_URL) {
      console.log('❌ Database not configured');
      return NextResponse.json(
        { error: 'Database not configured. Please set DATABASE_URL environment variable.' },
        { status: 500 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log('❌ OpenAI API key not configured');
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    // Generate 1536-dimensional vector embedding
    console.log(`🧠 Generating embedding for: "${content.slice(0, 100)}..."`);
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: content,
    });

    const vectorString = `[${embedding.join(',')}]`;
    console.log(`✅ Embedding generated: ${embedding.length} dimensions`);

    // Store in vector database with automatic indexing
    console.log('💾 Storing in vector database...');
    const result = await pool.query(
      'INSERT INTO content_chunks (content, embedding, source) VALUES ($1, $2, $3) RETURNING id',
      [content, vectorString, source]
    );

    const insertedId = result.rows[0].id;
    console.log(`✅ Successfully stored with ID: ${insertedId}`);

    // Content is now immediately searchable
    return NextResponse.json({
      success: true,
      id: insertedId,
      message: 'Content embedded and immediately available for search'
    });

        } catch (error: unknown) {
    console.error('❌ Embedding process failed:', error);
    const err = error as Error & { code?: string; message?: string };

    // Handle specific error types with appropriate responses
    if (err.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Database connection failed. Please ensure the database is running.' },
        { status: 500 }
      );
    }

    if (err.message?.includes('insufficient_quota')) {
      return NextResponse.json(
        { error: 'OpenAI API quota exceeded. Please check your billing and usage.' },
        { status: 429 }
      );
    }

    if (err.message?.includes('invalid_api_key')) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key. Please check your configuration.' },
        { status: 401 }
      );
    }

    if (err.code === '42P01') {
      return NextResponse.json(
        { error: 'Database table not found. Please run the database schema setup.' },
        { status: 500 }
      );
    }

    // Generic error fallback
    return NextResponse.json(
      {
        error: 'Failed to embed content',
        details: err.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint with embedding count
export async function GET() {
  try {
    console.log('📊 Checking embedding database status...');
    const result = await pool.query('SELECT COUNT(*) as count FROM content_chunks');
    const count = parseInt(result.rows[0].count);

    console.log(`✅ Database healthy - ${count} embeddings stored`);
    return NextResponse.json({
      message: 'Embed API is ready',
      totalEmbeddings: count,
      status: 'healthy'
    });

  } catch (error: unknown) {
    console.error('❌ Health check failed:', error);
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 500 }
    );
  }
}
