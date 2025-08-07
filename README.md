# RAG Chatbot Demo

A Next.js chatbot application that uses RAG (Retrieval-Augmented Generation) to answer questions based on your knowledge base. The chatbot searches through embedded documents using vector similarity and provides context-aware responses.

## Features

- 🤖 AI-powered chatbot using OpenAI GPT-4
- 🔍 Vector search through your knowledge base
- 📊 PostgreSQL with pgvector for vector storage
- 🛠️ Debug mode to inspect tool calls and search results
- ⚡ Batch embedding processing for performance

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- OpenAI API key

## Getting Started

### 1. Environment Setup

Create a `.env` file in the project root:

```bash
# Database configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/ragchatbot_db

# OpenAI API key (replace with your actual API key)
OPENAI_API_KEY=your-openai-api-key-here

# Next.js configuration (optional)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### 2. Start the Database

Start the PostgreSQL database with pgvector using Docker Compose:

```bash
docker-compose up -d
```

This will:
- Start a PostgreSQL 17 container with pgvector extension
- Create the `ragchatbot_db` database
- Run the schema setup from `postgres/schema.sql`
- Make the database available on `localhost:5432`

### 3. Install Dependencies

```bash
npm install
```

### 4. Prepare Your Data

Add your text data to `input/data.txt`. The script will split this into chunks and embed them.

### 5. Embed Your Data

Process and embed your data into the vector database:

```bash
npx tsx scripts/embed.ts
```

This will:
- Split your text into chunks
- Generate embeddings using OpenAI's text-embedding-3-small
- Store them in PostgreSQL with pgvector

### 6. Start the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the chatbot.

## Usage

1. **Ask Questions**: Type questions related to your embedded data
2. **View Responses**: The AI will search your knowledge base and provide contextual answers
3. **Debug Mode**: Click "Debug: Tool calls" to see:
   - Search queries used
   - Retrieved document chunks
   - Similarity rankings
   - Source information

## Project Structure

```
├── app/
│   ├── api/chat/route.ts    # Chat API endpoint
│   └── page.tsx             # Main chat interface
├── tools/
│   └── vectorSearch.ts      # Vector search tool implementation
├── scripts/
│   ├── embed.ts             # Batch embedding script
│   └── query.ts             # Test query script
├── postgres/
│   └── schema.sql           # Database schema
├── input/
│   └── data.txt             # Your source data
└── docker-compose.yml       # PostgreSQL + pgvector setup
```

## Troubleshooting

### Database Connection Issues
- Ensure Docker is running: `docker ps`
- Check database logs: `docker-compose logs db`
- Verify connection: `npx tsx scripts/query.ts "test query"`

### Embedding Issues
- Verify OpenAI API key is set correctly
- Check input data format in `input/data.txt`
- Monitor embedding progress in console output

### Chat Not Responding
- Ensure database has embedded data
- Check browser console for errors
- Verify API key and database connection

## Scripts

- `npm run dev` - Start development server
- `npx tsx scripts/embed.ts` - Embed your data
- `npx tsx scripts/query.ts "your question"` - Test vector search

## Technologies

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, AI SDK
- **Database**: PostgreSQL 17 with pgvector
- **AI**: OpenAI GPT-4 and text-embedding-3-small
- **Infrastructure**: Docker Compose
