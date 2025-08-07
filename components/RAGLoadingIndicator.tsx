'use client';

import { useEffect, useState } from 'react';

interface RAGLoadingIndicatorProps {
  className?: string;
}

// RAG pipeline stages with realistic timing
const RAG_STAGES = [
  {
    icon: '🔍',
    text: 'Searching knowledge base...',
    duration: 1000, // 1 second
    description: 'Converting query to vector embedding'
  },
  {
    icon: '📊',
    text: 'Finding relevant content...',
    duration: 800, // 0.8 seconds
    description: 'Performing similarity search'
  },
  {
    icon: '🧠',
    text: 'Generating response...',
    duration: 2000, // 2 seconds (can be longer)
    description: 'LLM processing context and generating answer'
  }
];

export function RAGLoadingIndicator({ className = '' }: RAGLoadingIndicatorProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [dots, setDots] = useState('');

  // Animate through RAG pipeline stages
  useEffect(() => {
    const stageTimer = setTimeout(() => {
      if (currentStage < RAG_STAGES.length - 1) {
        setCurrentStage(prev => prev + 1);
      }
    }, RAG_STAGES[currentStage]?.duration || 1000);

    return () => clearTimeout(stageTimer);
  }, [currentStage]);

  // Animate dots for current stage
  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(dotTimer);
  }, []);

  // Reset when component mounts
  useEffect(() => {
    setCurrentStage(0);
    setDots('');
  }, []);

  const stage = RAG_STAGES[currentStage];

  return (
    <div className={`flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 ${className}`}>
      {/* Animated Icon */}
      <div className="flex-shrink-0">
        <div className="text-2xl animate-pulse">
          {stage?.icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Main Status */}
        <div className="flex items-center space-x-2">
          <span className="text-blue-700 dark:text-blue-300 font-medium">
            {stage?.text}
            <span className="inline-block w-8 text-left">{dots}</span>
          </span>
        </div>

        {/* Technical Description */}
        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 opacity-75">
          {stage?.description}
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center space-x-1 mb-1">
            <span className="text-xs text-blue-600 dark:text-blue-400">
              RAG Pipeline Progress:
            </span>
            <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
              {currentStage + 1} / {RAG_STAGES.length}
            </span>
          </div>

          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5">
            <div
              className="bg-blue-500 dark:bg-blue-400 h-1.5 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${((currentStage + 1) / RAG_STAGES.length) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Stage Indicators */}
        <div className="flex items-center space-x-2 mt-2">
          {RAG_STAGES.map((stageItem, index) => (
            <div key={index} className="flex items-center space-x-1">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index <= currentStage
                    ? 'bg-blue-500 dark:bg-blue-400'
                    : 'bg-blue-200 dark:bg-blue-700'
                }`}
              />
              <span
                className={`text-xs transition-colors duration-300 ${
                  index === currentStage
                    ? 'text-blue-700 dark:text-blue-300 font-medium'
                    : index < currentStage
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-blue-400 dark:text-blue-600'
                }`}
              >
                {stageItem.icon}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Simpler version for when you just want a quick loading state
export function SimpleRAGLoader({ className = '' }: { className?: string }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg ${className}`}>
      <div className="text-lg animate-pulse">🤖</div>
      <span className="text-gray-600 dark:text-gray-300">
        AI is thinking
        <span className="inline-block w-8 text-left">{dots}</span>
      </span>
    </div>
  );
}
