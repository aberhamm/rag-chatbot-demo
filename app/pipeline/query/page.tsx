'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { useHasActiveChat } from '@/contexts/ChatContext';

// Query processing pipeline steps
const QUERY_PIPELINE_STEPS = [
  {
    id: 'user-question',
    title: '1. User Question Input',
    description: 'User asks a question through the chat interface',
    icon: '💬',
    color: 'blue'
  },
  {
    id: 'tool-decision',
    title: '2. Tool Decision Making',
    description: 'LLM analyzes query and decides to use vector search',
    icon: '🤖',
    color: 'cyan'
  },
  {
    id: 'query-embedding',
    title: '3. Query Embedding',
    description: 'Convert user question to 1536-dimensional vector',
    icon: '🔍',
    color: 'purple'
  },
  {
    id: 'similarity-search',
    title: '4. Similarity Search',
    description: 'Find most relevant content using cosine similarity',
    icon: '📊',
    color: 'red'
  },
  {
    id: 'context-assembly',
    title: '5. Context Assembly',
    description: 'Prepare retrieved chunks for LLM consumption',
    icon: '📋',
    color: 'orange'
  },
  {
    id: 'response-generation',
    title: '6. Response Generation',
    description: 'LLM creates informed answer using retrieved context',
    icon: '✨',
    color: 'yellow'
  }
];

interface PipelineData {
  step: string;
  data: any;
  processing: boolean;
  completed: boolean;
}

export default function QueryPipelinePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [pipelineData, setPipelineData] = useState<Record<string, PipelineData>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [sampleQuery] = useState("What is your refund policy?");

  const hasActiveChat = useHasActiveChat();

  const resetDemo = () => {
    setCurrentStep(0);
    setPipelineData({});
    setIsRunning(false);

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const scrollToStep = (stepIndex: number) => {
    const stepElement = document.getElementById(`query-step-${stepIndex}`);
    if (stepElement) {
      stepElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  };

  const runStep = async (stepIndex: number) => {
    const step = QUERY_PIPELINE_STEPS[stepIndex];
    if (!step) return;

    setIsRunning(true);

    setPipelineData(prev => ({
      ...prev,
      [step.id]: {
        step: step.id,
        data: null,
        processing: true,
        completed: false
      }
    }));

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setPipelineData(prev => ({
          ...prev,
          [step.id]: {
            step: step.id,
            data: getStepData(step.id),
            processing: false,
            completed: true
          }
        }));
        setIsRunning(false);
        resolve();
      }, 1500); // Faster for query pipeline (real-time feel)
    });
  };

  const getStepData = (stepId: string) => {
    switch (stepId) {
      case 'user-question':
        return {
          query: sampleQuery,
          timestamp: new Date().toLocaleTimeString(),
          source: 'Chat Interface',
          intent: 'Policy Information Request',
          complexity: 'Simple factual query',
          expectedType: 'Knowledge retrieval needed'
        };

      case 'tool-decision':
        return {
          userQuery: sampleQuery,
          llmThinking: [
            'The user is asking about "refund policy"',
            'This seems like a question about company policies/procedures',
            'I need to search my knowledge base for relevant information',
            'This requires the vectorSearch tool to find relevant documents'
          ],
          toolSelected: 'vectorSearch',
          reasoning: 'Query appears to be asking for specific company policy information that would be found in documentation',
          systemPrompt: 'You have access to a vector search tool. Use it when users ask questions that require knowledge retrieval.',
          confidence: 0.95,
          alternatives: [
            { tool: 'direct_answer', confidence: 0.05, reason: 'Too low - no knowledge of specific policies' },
            { tool: 'vectorSearch', confidence: 0.95, reason: 'High - policy question needs knowledge retrieval' }
          ],
          decisionTime: '23ms'
        };

      case 'query-embedding':
        return {
          query: sampleQuery,
          model: 'text-embedding-3-small',
          dimensions: 1536,
          processingTime: '45ms',
          vectorSample: [-0.0156, 0.2234, -0.0891, 0.1456, -0.2011, 0.0723, 0.1889, -0.1456, 0.0934, -0.1123],
          cost: '$0.000002',
          vectorNorm: 1.0,
          ready: true
        };

      case 'similarity-search':
        return {
                    algorithm: 'Cosine Similarity',
          indexType: 'HNSW',
          searchTime: '12ms',
          vectorsScanned: 5,
          results: [
            {
              content: 'What is the refund policy?\nCustomers may request a full refund within 30 days of purchase by contacting support.',
              score: 0.7351,
              rank: 1,
              chunkId: 'chunk_001',
              source: 'data.txt'
            },
            {
              content: 'Do you offer a free trial?\nYes, we provide a 14-day free trial with full access to all features.',
              score: 0.2995,
              rank: 2,
              chunkId: 'chunk_008',
              source: 'data.txt'
            },
            {
              content: 'Do you offer an API?\nYes, our REST API documentation is available under Developers → API Reference.',
              score: 0.2496,
              rank: 3,
              chunkId: 'chunk_019',
              source: 'data.txt'
            }
          ],
          totalResults: 3,
          threshold: 0.25
        };

      case 'context-assembly':
        return {
          retrievedChunks: 3,
          totalTokens: 118,
          contextTemplate: 'Based on the following information: {context}\n\nAnswer the user question: {query}',
          assembledContext: `Based on the following information from our knowledge base:

1. What is the refund policy?
Customers may request a full refund within 30 days of purchase by contacting support.

2. Do you offer a free trial?
Yes, we provide a 14-day free trial with full access to all features.

3. Do you offer an API?
Yes, our REST API documentation is available under Developers → API Reference.

Answer the user question: What is your refund policy?`,
          contextSize: '476 characters',
          ready: true
        };

      case 'response-generation':
        return {
          model: 'GPT-4',
          contextProvided: true,
          inputTokens: 118,
          outputTokens: 45,
          totalTokens: 163,
          processingTime: '0.8s',
          response: 'Based on our refund policy, customers may request a full refund within 30 days of purchase by contacting support. This policy ensures you have ample time to evaluate your purchase and request a refund if needed.',
          cost: '$0.00326',
          confidence: 'High - perfect match (73.5% similarity)'
        };

      default:
        return {};
    }
  };

    const runNextStep = async () => {
    if (currentStep < QUERY_PIPELINE_STEPS.length) {
      // Scroll immediately to next step
      scrollToStep(currentStep);

      await runStep(currentStep);
      setCurrentStep(prev => prev + 1);
    }
  };

    const runFullPipeline = async () => {
    resetDemo();
    setIsRunning(true);

    for (let i = 0; i < QUERY_PIPELINE_STEPS.length; i++) {
      // Scroll immediately to current step
      scrollToStep(i);

      await runStep(i);
      setCurrentStep(i + 1);

      if (i < QUERY_PIPELINE_STEPS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Faster transitions
      }
    }
    setIsRunning(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowRight') {
        e.preventDefault();
        if (!isRunning && currentStep < QUERY_PIPELINE_STEPS.length) {
          runNextStep();
        }
      } else if (e.code === 'KeyR' && e.ctrlKey) {
        e.preventDefault();
        resetDemo();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRunning, currentStep]);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex space-x-4">
          <Link
            href="/pipeline/data"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Data Pipeline
          </Link>
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 underline"
          >
            Chat Interface
            {hasActiveChat && (
              <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                Active session
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          💬 Query Processing Pipeline
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
          How user questions get answered using RAG
        </p>
        <div className="flex justify-center space-x-4 text-sm">
          <Link
            href="/pipeline/data"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Previous: Data Pipeline
          </Link>
        </div>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Demo Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <Button
              onClick={runNextStep}
              disabled={isRunning || currentStep >= QUERY_PIPELINE_STEPS.length}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              {isRunning ? '⏳ Processing...' :
               currentStep === 0 ? '▶️ Start Query' :
               currentStep >= QUERY_PIPELINE_STEPS.length ? '✅ Complete' :
               `➡️ Next Step (${currentStep + 1})`}
            </Button>
            <Button
              onClick={runFullPipeline}
              disabled={isRunning || currentStep > 0}
              variant="outline"
              className="disabled:opacity-50"
            >
              {isRunning ? '🚀 Running...' : '🚀 Run Full Query'}
            </Button>
            <Button
              onClick={resetDemo}
              disabled={isRunning}
              variant="outline"
              className="disabled:opacity-50"
            >
              🔄 Reset Demo
            </Button>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Progress: {currentStep} / {QUERY_PIPELINE_STEPS.length} steps
              </div>
              {currentStep > 0 && (
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / QUERY_PIPELINE_STEPS.length) * 100}%` }}
                  />
                </div>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                💡 Use spacebar or → to advance steps
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floating Controls */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <Button
              onClick={runNextStep}
              disabled={isRunning || currentStep >= QUERY_PIPELINE_STEPS.length}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              {isRunning ? '⏳' :
               currentStep === 0 ? '▶️' :
               currentStep >= QUERY_PIPELINE_STEPS.length ? '✅' :
               '➡️'}
            </Button>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {currentStep} / {QUERY_PIPELINE_STEPS.length}
            </div>
            {currentStep > 0 && (
              <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                <div
                  className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / QUERY_PIPELINE_STEPS.length) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pipeline Steps */}
      <div className="grid gap-6">
        {QUERY_PIPELINE_STEPS.map((step, index) => {
          const stepData = pipelineData[step.id];
          const isActive = index < currentStep && stepData?.processing;
          const isCompleted = stepData?.completed || false;
          const isProcessing = stepData?.processing || false;
          const isUpcoming = index >= currentStep;

          return (
            <Card
              key={step.id}
              id={`query-step-${index}`}
              className={`transition-all duration-300 ${
                isProcessing ? 'ring-2 ring-purple-500 shadow-lg bg-purple-50 dark:bg-purple-950/30' :
                isCompleted ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' :
                isUpcoming ? 'opacity-60 border-gray-200 dark:border-gray-700' :
                'border-gray-200 dark:border-gray-700'
              }`}
            >
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <span className="text-2xl">{step.icon}</span>
                  <span>{step.title}</span>
                  {isProcessing && (
                    <div className="animate-spin text-purple-500">⏳</div>
                  )}
                  {isCompleted && (
                    <div className="text-green-500">✅</div>
                  )}
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
              </CardHeader>

              {stepData && (
                <CardContent>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <QueryStepVisualization stepId={step.id} data={stepData.data} />
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Final Result */}
      {currentStep >= QUERY_PIPELINE_STEPS.length && (
        <Card className="mt-8 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200">🎉 Query Processing Complete!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 dark:text-green-300 mb-4">
              The user received an accurate, contextual answer based on the knowledge base! This entire process happened in under 2 seconds.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Try the Live Chat Interface →
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Educational Notes */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>🎓 Query Pipeline Key Concepts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Performance Characteristics:</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• <strong>Real-time Processing:</strong> Sub-second response times</li>
                <li>• <strong>Low Cost:</strong> ~$0.004 per query</li>
                <li>• <strong>High Throughput:</strong> 100+ concurrent queries</li>
                <li>• <strong>Scalable Search:</strong> Logarithmic complexity</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">AI Decision Making:</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• <strong>Tool Calling:</strong> Autonomous decision to search</li>
                <li>• <strong>Context Awareness:</strong> Relevant information retrieval</li>
                <li>• <strong>Response Grounding:</strong> Answers based on facts</li>
                <li>• <strong>Quality Control:</strong> Confidence-based responses</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Component to visualize each query pipeline step
function QueryStepVisualization({ stepId, data }: { stepId: string; data: any }) {
  if (!data) return null;

  switch (stepId) {
    case 'user-question':
      return (
        <div>
          <h4 className="font-semibold mb-2">User Question Analysis</h4>
          <div className="space-y-2">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded border">
              <div className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                💬 User Question
              </div>
              <div className="text-lg">"{data.query}"</div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Timestamp:</strong> {data.timestamp}</div>
              <div><strong>Source:</strong> {data.source}</div>
              <div><strong>Intent:</strong> {data.intent}</div>
              <div><strong>Expected Type:</strong> {data.expectedType}</div>
            </div>
          </div>
        </div>
      );

    case 'tool-decision':
      return (
        <div>
          <h4 className="font-semibold mb-2">LLM Tool Decision Process</h4>
          <div className="space-y-4">
            {/* User Query Analysis */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded border">
              <div className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                📝 Analyzing User Query
              </div>
              <div className="text-sm">"{data.userQuery}"</div>
            </div>

            {/* LLM Reasoning Process */}
            <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded border">
              <div className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                🧠 LLM Internal Reasoning
              </div>
              <div className="space-y-1">
                {data.llmThinking.map((thought: string, i: number) => (
                  <div key={i} className="text-sm flex items-start space-x-2">
                    <span className="text-purple-600 font-mono text-xs mt-1">{i + 1}.</span>
                    <span>"{thought}"</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tool Selection */}
            <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded border">
              <div className="font-semibold text-green-800 dark:text-green-200 mb-2">
                🛠️ Tool Selection Decision
              </div>
              <div className="space-y-2 text-sm">
                <div><strong>Selected Tool:</strong> {data.toolSelected}</div>
                <div><strong>Confidence:</strong> {(data.confidence * 100).toFixed(1)}%</div>
                <div><strong>Decision Time:</strong> {data.decisionTime}</div>
                <div><strong>Reasoning:</strong> {data.reasoning}</div>
              </div>
            </div>

            {/* Alternative Considerations */}
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border">
              <div className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                ⚖️ Alternative Options Considered
              </div>
              <div className="space-y-1">
                {data.alternatives.map((alt: any, i: number) => (
                  <div key={i} className="text-sm flex justify-between items-center">
                    <span>{alt.tool}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs">{(alt.confidence * 100).toFixed(1)}%</span>
                      <span className="text-xs text-gray-500">{alt.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 'query-embedding':
      return (
        <div>
          <h4 className="font-semibold mb-2">Query Vector Embedding</h4>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Model:</strong> {data.model}</div>
              <div><strong>Dimensions:</strong> {data.dimensions}</div>
              <div><strong>Processing Time:</strong> {data.processingTime}</div>
              <div><strong>Cost:</strong> {data.cost}</div>
            </div>
            <div className="p-2 bg-white dark:bg-gray-800 rounded border">
              <div className="text-sm">
                <strong>Query:</strong> "{data.query}"
              </div>
            </div>
            <div className="p-2 bg-white dark:bg-gray-800 rounded border">
              <div className="text-sm font-mono">
                Vector sample: [{data.vectorSample.join(', ')}...]
              </div>
            </div>
          </div>
        </div>
      );

    case 'similarity-search':
      return (
        <div>
          <h4 className="font-semibold mb-2">Vector Similarity Search Results</h4>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><strong>Algorithm:</strong> {data.algorithm}</div>
              <div><strong>Search Time:</strong> {data.searchTime}</div>
              <div><strong>Vectors Scanned:</strong> {data.vectorsScanned}</div>
            </div>
            <div className="text-sm font-semibold">Top {data.results.length} Results (threshold: {data.threshold}):</div>
            {data.results.map((result: any, i: number) => (
              <div key={i} className="p-2 bg-white dark:bg-gray-800 rounded border">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-sm">{result.content}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Source: {result.source} | Chunk: {result.chunkId}
                    </div>
                  </div>
                  <div className="ml-2 text-right">
                    <div className="text-xs text-gray-500">Rank #{result.rank}</div>
                    <div className="text-sm font-semibold text-green-600">
                      {(result.score * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'context-assembly':
      return (
        <div>
          <h4 className="font-semibold mb-2">Context Assembly for LLM</h4>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Retrieved Chunks:</strong> {data.retrievedChunks}</div>
              <div><strong>Total Tokens:</strong> {data.totalTokens}</div>
              <div><strong>Context Size:</strong> {data.contextSize}</div>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded border">
              <div className="text-sm">
                <strong>Assembled Context for LLM:</strong>
                <div className="mt-2 whitespace-pre-wrap text-xs">{data.assembledContext}</div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'response-generation':
      return (
        <div>
          <h4 className="font-semibold mb-2">AI Response Generation</h4>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><strong>Model:</strong> {data.model}</div>
              <div><strong>Processing Time:</strong> {data.processingTime}</div>
              <div><strong>Total Tokens:</strong> {data.totalTokens}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Cost:</strong> {data.cost}</div>
              <div><strong>Confidence:</strong> {data.confidence}</div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded border">
              <div className="font-semibold text-green-800 dark:text-green-200 mb-2">
                ✨ Generated Response
              </div>
              <div className="text-sm">{data.response}</div>
            </div>
          </div>
        </div>
      );

    default:
      return <div>Step visualization not implemented</div>;
  }
}
