'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { useHasActiveChat } from '@/contexts/ChatContext';

// Data ingestion pipeline steps
const DATA_PIPELINE_STEPS = [
  {
    id: 'raw-input',
    title: '1. Raw Document Input',
    description: 'Source documents uploaded to the system',
    icon: '📄',
    color: 'blue'
  },
  {
    id: 'chunking',
    title: '2. Intelligent Chunking',
    description: 'Breaking documents into semantic segments',
    icon: '✂️',
    color: 'green'
  },
  {
    id: 'batch-embedding',
    title: '3. Batch Embedding Generation',
    description: 'Converting all chunks to vectors using embedMany',
    icon: '🧠',
    color: 'purple'
  },
  {
    id: 'vector-storage',
    title: '4. Vector Database Storage',
    description: 'Storing vectors in PostgreSQL with pgvector',
    icon: '💾',
    color: 'indigo'
  },
  {
    id: 'indexing',
    title: '5. Index Optimization',
    description: 'Building HNSW indexes for fast similarity search',
    icon: '🏗️',
    color: 'orange'
  },
  {
    id: 'knowledge-ready',
    title: '6. Knowledge Base Ready',
    description: 'System ready to answer user questions',
    icon: '✅',
    color: 'green'
  }
];

interface PipelineData {
  step: string;
  data: any;
  processing: boolean;
  completed: boolean;
}

export default function DataPipelinePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [pipelineData, setPipelineData] = useState<Record<string, PipelineData>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [sampleDocument] = useState(`What is the refund policy?
Customers may request a full refund within 30 days of purchase by contacting support.

How do I change my account password?
Go to Profile → Security, enter your current password, then choose a new one.

Do you offer a free trial?
Yes, we provide a 14-day free trial with full access to all features.

How can I contact customer support?
Email support@company.com or use the live chat widget in the bottom right corner.

Do you offer an API?
Yes, our REST API documentation is available under Developers → API Reference.`);

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
    const stepElement = document.getElementById(`data-step-${stepIndex}`);
    if (stepElement) {
      stepElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  };

  const runStep = async (stepIndex: number) => {
    const step = DATA_PIPELINE_STEPS[stepIndex];
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
      }, 2000); // Longer processing time for data pipeline
    });
  };

  const getStepData = (stepId: string) => {
    switch (stepId) {
      case 'raw-input':
        return {
          document: sampleDocument,
          size: sampleDocument.length,
          type: 'Customer Service FAQ',
          format: 'Plain Text',
          source: 'Documentation Upload'
        };

      case 'chunking':
        const chunks = sampleDocument.split('\n\n').filter(s => s.trim());
        return {
          strategy: 'Paragraph-based + RecursiveCharacterTextSplitter',
          chunks,
          count: chunks.length,
          avgLength: Math.round(chunks.reduce((acc, chunk) => acc + chunk.length, 0) / chunks.length),
          maxChunkSize: 512,
          overlap: 50
        };

      case 'batch-embedding':
        return {
          model: 'text-embedding-3-small',
          dimensions: 1536,
          batchSize: 50,
          totalChunks: 5,
          apiCalls: 1, // 5 chunks in 1 batch call
          costPerBatch: '$0.00001',
          totalCost: '$0.00001',
          efficiency: '5x cheaper than individual calls',
          sampleVector: [-0.0234, 0.1892, -0.0456, 0.2341, -0.1123, 0.0789, 0.3456, -0.2789, 0.1567, -0.0892],
          processingTime: '0.8s for all 5 chunks'
        };

      case 'vector-storage':
        return {
          database: 'PostgreSQL 15',
          extension: 'pgvector 0.5.1',
          table: 'content_chunks',
          vectorColumn: 'embedding',
          indexType: 'HNSW (Hierarchical Navigable Small World)',
          storagePerVector: '6.1 KB',
          totalStorage: '30.5 KB (5 vectors)',
          chunksStored: 5,
          columnsCreated: ['id', 'content', 'embedding', 'source']
        };

      case 'indexing':
        return {
          indexType: 'HNSW',
          distanceFunction: 'Cosine Distance (<=>)',
          efConstruction: 64,
          mValue: 16,
          buildTime: '156ms',
          indexSize: '2.4 KB',
          searchComplexity: 'O(log n)'
        };

      case 'knowledge-ready':
        return {
          totalVectors: 5,
          indexReady: true,
          searchLatency: '< 5ms average',
          concurrentQueries: 'Up to 100/sec',
          readyForQueries: true,
          nextStep: 'User can now ask questions!',
          sampleQueries: [
            'What is the refund policy?',
            'How do I enable two-factor authentication?',
            'Do you offer an API?'
          ]
        };

      default:
        return {};
    }
  };

    const runNextStep = async () => {
    if (currentStep < DATA_PIPELINE_STEPS.length) {
      // Scroll immediately to next step
      scrollToStep(currentStep);

      await runStep(currentStep);
      setCurrentStep(prev => prev + 1);
    }
  };

    const runFullPipeline = async () => {
    resetDemo();
    setIsRunning(true);

    for (let i = 0; i < DATA_PIPELINE_STEPS.length; i++) {
      // Scroll immediately to current step
      scrollToStep(i);

      await runStep(i);
      setCurrentStep(i + 1);

      if (i < DATA_PIPELINE_STEPS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }
    setIsRunning(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowRight') {
        e.preventDefault();
        if (!isRunning && currentStep < DATA_PIPELINE_STEPS.length) {
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
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Chat
            {hasActiveChat && (
              <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                Active session
              </span>
            )}
          </Link>
          <Link
            href="/embed"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 underline"
          >
            Add Content →
          </Link>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          📚 Data Ingestion Pipeline
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
          How knowledge gets into the RAG system
        </p>
        <div className="flex justify-center space-x-4 text-sm">
          <Link
            href="/pipeline/query"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Next: Query Pipeline →
          </Link>
        </div>
      </div>

      {/* Process Overview */}
      <Card className="mb-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-200">🎯 What This Pipeline Does</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Input:</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                <li>• Raw documents (PDFs, text files, web pages)</li>
                <li>• Unstructured content of any size</li>
                <li>• One-time or batch processing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Output:</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                <li>• Searchable vector database</li>
                <li>• Fast similarity search capability</li>
                <li>• Ready for real-time user queries</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Demo Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <Button
              onClick={runNextStep}
              disabled={isRunning || currentStep >= DATA_PIPELINE_STEPS.length}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isRunning ? '⏳ Processing...' :
               currentStep === 0 ? '▶️ Start Ingestion' :
               currentStep >= DATA_PIPELINE_STEPS.length ? '✅ Complete' :
               `➡️ Next Step (${currentStep + 1})`}
            </Button>
            <Button
              onClick={runFullPipeline}
              disabled={isRunning || currentStep > 0}
              variant="outline"
              className="disabled:opacity-50"
            >
              {isRunning ? '🚀 Running...' : '🚀 Run Full Ingestion'}
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
                Progress: {currentStep} / {DATA_PIPELINE_STEPS.length} steps
              </div>
              {currentStep > 0 && (
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / DATA_PIPELINE_STEPS.length) * 100}%` }}
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
              disabled={isRunning || currentStep >= DATA_PIPELINE_STEPS.length}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isRunning ? '⏳' :
               currentStep === 0 ? '▶️' :
               currentStep >= DATA_PIPELINE_STEPS.length ? '✅' :
               '➡️'}
            </Button>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {currentStep} / {DATA_PIPELINE_STEPS.length}
            </div>
            {currentStep > 0 && (
              <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / DATA_PIPELINE_STEPS.length) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pipeline Steps */}
      <div className="grid gap-6">
        {DATA_PIPELINE_STEPS.map((step, index) => {
          const stepData = pipelineData[step.id];
          const isActive = index < currentStep && stepData?.processing;
          const isCompleted = stepData?.completed || false;
          const isProcessing = stepData?.processing || false;
          const isUpcoming = index >= currentStep;

          return (
            <Card
              key={step.id}
              id={`data-step-${index}`}
              className={`transition-all duration-300 ${
                isProcessing ? 'ring-2 ring-blue-500 shadow-lg bg-blue-50 dark:bg-blue-950/30' :
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
                    <div className="animate-spin text-blue-500">⏳</div>
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
                    <DataStepVisualization stepId={step.id} data={stepData.data} />
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Next Steps */}
      {currentStep >= DATA_PIPELINE_STEPS.length && (
        <Card className="mt-8 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200">🎉 Data Ingestion Complete!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 dark:text-green-300 mb-4">
              Your knowledge base is now ready! The system can answer user questions using the ingested content.
            </p>
            <Link
              href="/pipeline/query"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Continue to Query Pipeline →
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Educational Notes */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>🎓 Data Pipeline Key Concepts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Performance Characteristics:</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• <strong>Batch Processing:</strong> Efficient for large documents</li>
                <li>• <strong>One-time Cost:</strong> Expensive upfront, cheap to query</li>
                <li>• <strong>Scalable Storage:</strong> Millions of vectors supported</li>
                <li>• <strong>Index Optimization:</strong> Fast search via HNSW</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Technical Implementation:</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• <strong>embedMany API:</strong> 50x more efficient than individual calls</li>
                <li>• <strong>Intelligent Chunking:</strong> Preserves semantic meaning</li>
                <li>• <strong>pgvector Extension:</strong> Production-grade vector storage</li>
                <li>• <strong>HNSW Indexing:</strong> Logarithmic search complexity</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Component to visualize each data pipeline step
function DataStepVisualization({ stepId, data }: { stepId: string; data: any }) {
  if (!data) return null;

  switch (stepId) {
    case 'raw-input':
      return (
        <div>
          <h4 className="font-semibold mb-2">Document Analysis</h4>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Type:</strong> {data.type}</div>
              <div><strong>Format:</strong> {data.format}</div>
              <div><strong>Size:</strong> {data.size} characters</div>
              <div><strong>Source:</strong> {data.source}</div>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded border max-h-40 overflow-y-auto">
              <strong>Document Content:</strong><br />
              <div className="text-sm mt-2 whitespace-pre-wrap">{data.document}</div>
            </div>
          </div>
        </div>
      );

    case 'chunking':
      return (
        <div>
          <h4 className="font-semibold mb-2">Chunking Strategy & Results</h4>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Strategy:</strong> {data.strategy}</div>
              <div><strong>Max Chunk Size:</strong> {data.maxChunkSize} chars</div>
              <div><strong>Overlap:</strong> {data.overlap} characters</div>
              <div><strong>Total Chunks:</strong> {data.count}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold">Generated Chunks:</div>
              {data.chunks.map((chunk: string, i: number) => (
                <div key={i} className="p-2 bg-white dark:bg-gray-800 rounded border text-sm">
                  <span className="text-blue-600 font-mono">Chunk {i + 1}:</span>
                  <div className="mt-1">{chunk}</div>
                </div>
              ))}
              <div className="text-sm text-gray-600">Average length: {data.avgLength} characters</div>
            </div>
          </div>
        </div>
      );

    case 'batch-embedding':
      return (
        <div>
          <h4 className="font-semibold mb-2">Batch Embedding Generation</h4>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Model:</strong> {data.model}</div>
              <div><strong>Dimensions:</strong> {data.dimensions}</div>
              <div><strong>Batch Size:</strong> {data.batchSize}</div>
              <div><strong>Total Chunks:</strong> {data.totalChunks}</div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded border">
              <div className="text-sm">
                <strong>Efficiency Gain:</strong> {data.efficiency}<br />
                <strong>API Calls:</strong> {data.apiCalls} (vs {data.totalChunks} individual calls)<br />
                <strong>Processing Time:</strong> {data.processingTime}<br />
                <strong>Total Cost:</strong> {data.totalCost} (vs ~${(data.totalChunks * 0.00002).toFixed(5)} individual)
              </div>
            </div>
            <div className="p-2 bg-white dark:bg-gray-800 rounded border">
              <div className="text-sm font-mono">
                <strong>Sample Vector (first 10 dimensions):</strong><br />
                [{data.sampleVector.join(', ')}...]
              </div>
            </div>
          </div>
        </div>
      );

    case 'vector-storage':
      return (
        <div>
          <h4 className="font-semibold mb-2">Vector Database Storage</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Database:</strong> {data.database}</div>
            <div><strong>Extension:</strong> {data.extension}</div>
            <div><strong>Table:</strong> {data.table}</div>
            <div><strong>Vector Column:</strong> {data.vectorColumn}</div>
            <div><strong>Chunks Stored:</strong> {data.chunksStored}</div>
            <div><strong>Total Storage:</strong> {data.totalStorage}</div>
          </div>
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded border">
            <div className="text-sm">
              <strong>Table Schema:</strong> {data.columnsCreated.join(', ')}
            </div>
          </div>
        </div>
      );

    case 'indexing':
      return (
        <div>
          <h4 className="font-semibold mb-2">Index Optimization</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Index Type:</strong> {data.indexType}</div>
            <div><strong>Distance Function:</strong> {data.distanceFunction}</div>
            <div><strong>Build Time:</strong> {data.buildTime}</div>
            <div><strong>Index Size:</strong> {data.indexSize}</div>
            <div><strong>Search Complexity:</strong> {data.searchComplexity}</div>
          </div>
        </div>
      );

    case 'knowledge-ready':
      return (
        <div>
          <h4 className="font-semibold mb-2">System Status</h4>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Total Vectors:</strong> {data.totalVectors}</div>
              <div><strong>Index Ready:</strong> {data.indexReady ? '✅ Yes' : '❌ No'}</div>
              <div><strong>Search Latency:</strong> {data.searchLatency}</div>
              <div><strong>Concurrent Queries:</strong> {data.concurrentQueries}</div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded border">
              <div className="text-green-700 dark:text-green-300 font-semibold mb-2">
                🎉 {data.nextStep}
              </div>
              <div className="text-sm">
                <strong>Try asking these questions:</strong>
                <ul className="mt-1 space-y-1">
                  {data.sampleQueries.map((q: string, i: number) => (
                    <li key={i} className="text-green-600 dark:text-green-400">• "{q}"</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return <div>Step visualization not implemented</div>;
  }
}
