'use client';

import React from 'react';

interface SuccessMessageProps {
  message: string;
  onDismiss?: () => void;
}

export default function SuccessMessage({ message, onDismiss }: SuccessMessageProps) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
      <div className="flex-shrink-0">
        <svg 
          className="w-5 h-5 text-green-600 mt-0.5" 
          fill="currentColor" 
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path 
            fillRule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
            clipRule="evenodd" 
          />
        </svg>
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-green-800">
          {message}
        </p>
      </div>
      
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-green-400 hover:text-green-600 transition-colors"
          aria-label="Dismiss success message"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path 
              fillRule="evenodd" 
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>
      )}
    </div>
  );
} 