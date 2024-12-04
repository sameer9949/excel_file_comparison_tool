import React from 'react';
import { ComparisonResult } from '../types/comparison';
import { ArrowRight, Plus, Minus, RefreshCw } from 'lucide-react';

interface ComparisonTableProps {
  results: ComparisonResult[];
}

export function ComparisonTable({ results }: ComparisonTableProps) {
  if (!results.length) return null;

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Old Value</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Value</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {results.map((result, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                {result.changeType === 'added' && (
                  <Plus className="w-5 h-5 text-green-500" />
                )}
                {result.changeType === 'removed' && (
                  <Minus className="w-5 h-5 text-red-500" />
                )}
                {result.changeType === 'modified' && (
                  <RefreshCw className="w-5 h-5 text-yellow-500" />
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.key}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {result.oldValue || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {result.newValue || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}