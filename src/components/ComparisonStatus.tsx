import React from 'react';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

interface ComparisonStatusProps {
  status: 'idle' | 'comparing' | 'success' | 'error';
  error?: string;
}

export function ComparisonStatus({ status, error }: ComparisonStatusProps) {
  if (status === 'idle') return null;

  const statusConfig = {
    comparing: {
      icon: <Loader2 className="w-5 h-5 animate-spin" />,
      text: 'Comparing files...',
      className: 'text-blue-600 bg-blue-50',
    },
    success: {
      icon: <CheckCircle className="w-5 h-5" />,
      text: 'Comparison completed successfully!',
      className: 'text-green-600 bg-green-50',
    },
    error: {
      icon: <AlertCircle className="w-5 h-5" />,
      text: error || 'An error occurred during comparison',
      className: 'text-red-600 bg-red-50',
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`mt-4 p-4 rounded-lg ${config.className}`}>
      <div className="flex items-center gap-2">
        {config.icon}
        <span className="font-medium">{config.text}</span>
      </div>
      {status === 'error' && error && (
        <p className="mt-2 text-sm text-red-500 ml-7">{error}</p>
      )}
    </div>
  );
}