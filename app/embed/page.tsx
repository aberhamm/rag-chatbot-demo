'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useHasActiveChat } from '@/contexts/ChatContext';

interface FormData {
  content: string;
  source: string;
}

interface FormErrors {
  content?: string;
  source?: string;
  general?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

export default function EmbedPage() {
  const [formData, setFormData] = useState<FormData>({
    content: '',
    source: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [totalEmbeddings, setTotalEmbeddings] = useState<number | null>(null);
  const hasActiveChat = useHasActiveChat();

  // Load current count when component mounts
  useState(() => {
    fetch('/api/embed')
      .then(res => res.json())
      .then(data => {
        if (data.totalEmbeddings !== undefined) {
          setTotalEmbeddings(data.totalEmbeddings);
        }
      })
      .catch(console.error);
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length > 10000) {
      newErrors.content = 'Content must be 10,000 characters or less';
    }

    if (!formData.source.trim()) {
      newErrors.source = 'Source is required';
    } else if (formData.source.length > 255) {
      newErrors.source = 'Source must be 255 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const response = await fetch('/api/embed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          // Handle validation errors from API
          const newErrors: FormErrors = {};
          data.details.forEach((detail: ValidationError) => {
            if (detail.field === 'content') newErrors.content = detail.message;
            if (detail.field === 'source') newErrors.source = detail.message;
          });
          setErrors(newErrors);
        } else {
          setErrors({ general: data.error || 'Failed to embed content' });
        }
        return;
      }

      setSuccessMessage(`Content embedded successfully! (ID: ${data.id})`);
      setFormData({ content: '', source: '' });

      // Update total count
      if (totalEmbeddings !== null) {
        setTotalEmbeddings(totalEmbeddings + 1);
      }

    } catch (error) {
      console.error('Submit error:', error);
      setErrors({
        general: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Clear success message when user starts editing
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
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

        {hasActiveChat && (
          <div className="text-sm text-gray-600">
            💬 You have an ongoing chat conversation
          </div>
        )}
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Add Content to Knowledge Base</span>
            {totalEmbeddings !== null && (
              <span className="text-sm font-normal text-gray-600">
                Total embeddings: {totalEmbeddings}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errors.general}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {successMessage}
              </div>
            )}

            {/* Content Field */}
            <div className="space-y-2">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content *
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Enter the text content you want to add to the knowledge base..."
                className={`w-full p-3 border rounded-lg resize-vertical min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.content ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{formData.content.length}/10,000 characters</span>
                {errors.content && (
                  <span className="text-red-500">{errors.content}</span>
                )}
              </div>
            </div>

            {/* Source Field */}
            <div className="space-y-2">
              <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                Source *
              </label>
              <Input
                id="source"
                type="text"
                value={formData.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
                placeholder="e.g., manual-entry, documentation, FAQ..."
                className={errors.source ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{formData.source.length}/255 characters</span>
                {errors.source && (
                  <span className="text-red-500">{errors.source}</span>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !formData.content.trim() || !formData.source.trim()}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Embedding...
                </>
              ) : (
                'Add to Knowledge Base'
              )}
            </Button>
          </form>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Tips:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Add clear, concise content that users might ask questions about</li>
              <li>• Use descriptive sources to help identify content later</li>
              <li>• Content will be automatically embedded and made searchable</li>
              <li>• You can test the content by asking related questions in the chat</li>
              {hasActiveChat && (
                <li className="text-green-700 font-medium">
                  • Your chat session will be preserved when you return to continue the conversation
                </li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
