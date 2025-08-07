'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Link from 'next/link';
import { useChatContext } from '@/contexts/ChatContext';
import { RAGLoadingIndicator } from '@/components/rag-loading-indicator';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, hasActiveChat, clearChat, isLoading } = useChatContext();
  const [showDebug, setShowDebug] = useState(false);

  const customHandleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
  };

  const renderMessage = (message: { role: string; content: string; toolInvocations?: ToolInvocation[] }) => {
    const isUser = message.role === 'user';
    const hasToolInvocations = message.toolInvocations && message.toolInvocations.length > 0;

    return (
      <div className={`mb-4 ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block p-2 rounded-lg ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{message.content}</div>

                      {/* Debug section for tool calls */}
              {!isUser && hasToolInvocations && message.toolInvocations && showDebug && (
                <ToolCallDebugSection toolInvocations={message.toolInvocations} />
              )}
      </div>
    );
  };

    return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header Section */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          RAG Chatbot Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Ask questions and get answers powered by vector search and AI
        </p>
      </div>

      {/* Chat Interface - Primary Focus */}
      <Card className="w-full mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Chat with AI</span>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowDebug(!showDebug)}
                variant="outline"
                size="sm"
                className={`${showDebug ? 'bg-blue-100 text-blue-700 border-blue-300' : 'text-gray-600'}`}
              >
                {showDebug ? '🔍 Hide Debug' : '🔍 Show Debug'}
              </Button>
              {hasActiveChat && (
                <Button
                  onClick={clearChat}
                  variant="outline"
                  size="sm"
                  className="text-gray-600 hover:text-red-600"
                >
                  Clear Chat
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh] mb-4 p-4 border rounded">
          {messages.map((message, index) => (
            <div key={index}>{renderMessage(message)}</div>
          ))}

          {/* Show RAG Pipeline Loading Indicator when AI is processing */}
          {isLoading && (
            <div className="mb-4">
              <RAGLoadingIndicator />
            </div>
          )}
        </ScrollArea>
        <form onSubmit={customHandleSubmit} className="flex space-x-2">
          <Input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={isLoading ? "AI is processing..." : "Type your message here..."}
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? '⏳' : 'Send'}
          </Button>
        </form>
      </CardContent>
    </Card>

      {/* Navigation Section */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Explore the RAG System
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            href="/embed"
            className="group p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            <div className="text-blue-600 dark:text-blue-400 text-2xl mb-2">📝</div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Add Content</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Add documents to the knowledge base
            </p>
          </Link>

          <Link
            href="/pipeline/data"
            className="group p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
          >
            <div className="text-green-600 dark:text-green-400 text-2xl mb-2">📚</div>
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">Data Pipeline</h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              See how documents become searchable
            </p>
          </Link>

          <Link
            href="/pipeline/query"
            className="group p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
          >
            <div className="text-purple-600 dark:text-purple-400 text-2xl mb-2">💬</div>
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Query Pipeline</h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              See how questions get answered
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

interface ToolInvocation {
  toolName: string;
  args?: { query?: string };
  result?: { results?: Array<{ content: string; source: string; rank: number }> };
}

function ToolCallDebugSection({ toolInvocations }: { toolInvocations: ToolInvocation[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-2 text-left">
      <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
        <span>{isExpanded ? '▼' : '▶'}</span>
        <span>Debug: Tool calls ({toolInvocations.length})</span>
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2 text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded border">
          {toolInvocations.map((tool, index: number) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-2 rounded border">
              <div className="font-semibold text-blue-600 dark:text-blue-400 mb-1">🔧 {tool.toolName}</div>
              <div className="text-gray-600 dark:text-gray-300 mb-2">
                <strong>Query:</strong> {tool.args?.query}
              </div>
              {tool.result && (
                <div>
                  <div className="font-semibold text-green-600 dark:text-green-400 mb-1">Results:</div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {tool.result.results?.map((result, idx: number) => (
                      <div key={idx} className="bg-gray-100 dark:bg-gray-700 p-1 rounded">
                        <div className="text-gray-800 dark:text-gray-200 text-xs">{result.content}</div>
                        <div className="text-gray-500 text-xs mt-1">
                          Source: {result.source} | Rank: {result.rank}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
