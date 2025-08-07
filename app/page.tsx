'use client';

import { useChat } from '@ai-sdk/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Link from 'next/link';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
  });

  const customHandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e); // Call the handleSubmit from useChat
  };

  const renderMessage = (message: { role: string; content: string; toolInvocations?: ToolInvocation[] }) => {
    const isUser = message.role === 'user';
    const hasToolInvocations = message.toolInvocations && message.toolInvocations.length > 0;

    return (
      <div className={`mb-4 ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block p-2 rounded-lg ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{message.content}</div>

        {/* Debug section for tool calls */}
        {!isUser && hasToolInvocations && message.toolInvocations && (
          <ToolCallDebugSection toolInvocations={message.toolInvocations} />
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-6 text-center">
        <Link
          href="/embed"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          📝 Add Content to Knowledge Base
        </Link>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Chat with AI</CardTitle>
        </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh] mb-4 p-4 border rounded">
          {messages.map((message, index) => (
            <div key={index}>{renderMessage(message)}</div>
          ))}
        </ScrollArea>
        <form onSubmit={customHandleSubmit} className="flex space-x-2">
          <Input type="text" value={input} onChange={handleInputChange} placeholder="Type your message here..." className="flex-1" />
          <Button type="submit">Send</Button>
        </form>
      </CardContent>
    </Card>
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
