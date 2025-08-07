import { NextRequest, NextResponse } from 'next/server';
import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';
import { Pool } from 'pg';
import { z } from 'zod';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Validation schema
const embedRequestSchema = z.object({
  content: z.string().min(1, 'Content cannot be empty').max(10000, 'Content too long (max 10,000 characters)'),
  source: z.string().min(1, 'Source cannot be empty').max(255, 'Source too long (max 255 characters)'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validation = embedRequestSchema.safeParse(body);
    if (!validation.success) {
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

    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not configured. Please set DATABASE_URL environment variable.' },
        { status: 500 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    console.log(`Embedding content: ${content.slice(0, 100)}...`);

    // Generate embedding
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: content,
    });

    const vectorString = `[${embedding.join(',')}]`;

    // Insert into database
    console.log('Inserting into database...');
    const result = await pool.query(
      'INSERT INTO content_chunks (content, embedding, source) VALUES ($1, $2, $3) RETURNING id',
      [content, vectorString, source]
    );

    const insertedId = result.rows[0].id;
    console.log(`Successfully inserted with ID: ${insertedId}`);

    return NextResponse.json({
      success: true,
      id: insertedId,
      message: 'Content embedded successfully'
    });

  } catch (error: unknown) {
    console.error('Embedding error:', error);

    // Handle specific error types
    const err = error as Error & { code?: string; message?: string };
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

    // Generic error response
    return NextResponse.json(
      {
        error: 'Failed to embed content',
        details: err.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get count of embedded items
    const result = await pool.query('SELECT COUNT(*) as count FROM content_chunks');
    const count = parseInt(result.rows[0].count);

    return NextResponse.json({
      message: 'Embed API is ready',
      totalEmbeddings: count
    });
  } catch (error: unknown) {
    console.error('Database check error:', error);
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 500 }
    );
  }
}
