import React, { useState } from 'react';
import { FileSpreadsheet, Download } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { ComparisonStatus } from './components/ComparisonStatus';
import { ComparisonTable } from './components/ComparisonTable';
import { compareExcelFiles, ApiError } from './services/api';
import { ComparisonResult } from './types/comparison';

type Status = 'idle' | 'comparing' | 'success' | 'error';

function App() {
  const [oldFile, setOldFile] = useState<File | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string>('');
  const [results, setResults] = useState<ComparisonResult[]>([]);

  const handleCompare = async () => {
    if (!oldFile || !newFile) {
      setError('Please select both files');
      setStatus('error');
      return;
    }

    try {
      setStatus('comparing');
      setError('');
      const result = await compareExcelFiles(oldFile, newFile);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([result], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'comparison-result.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setStatus('success');
    } catch (err) {
      console.error('Comparison error:', err);
      const errorMessage = err instanceof ApiError 
        ? `${err.message}${err.details ? ` (${err.details})` : ''}`
        : 'An unexpected error occurred while comparing files';
      setError(errorMessage);
      setStatus('error');
    }
  };

  const handleFileSelect = (type: 'old' | 'new', file: File) => {
    if (type === 'old') {
      setOldFile(file);
    } else {
      setNewFile(file);
    }
    setStatus('idle');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <FileSpreadsheet className="mx-auto h-12 w-12 text-blue-600" />
          <h1 className="mt-3 text-3xl font-bold text-gray-900">Excel File Comparison</h1>
          <p className="mt-2 text-gray-600">Upload two Excel files to compare and get the differences</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium mb-3">Original File</h2>
              <FileUpload
                onFileSelect={(file) => handleFileSelect('old', file)}
                label={oldFile ? oldFile.name : 'Upload original Excel file'}
              />
            </div>
            
            <div>
              <h2 className="text-lg font-medium mb-3">New File</h2>
              <FileUpload
                onFileSelect={(file) => handleFileSelect('new', file)}
                label={newFile ? newFile.name : 'Upload new Excel file'}
              />
            </div>
          </div>

          <ComparisonStatus status={status} error={error} />

          <div className="flex justify-center">
            <button
              onClick={handleCompare}
              disabled={!oldFile || !newFile || status === 'comparing'}
              className={`flex items-center gap-2 px-6 py-3 rounded-md text-white transition-colors
                ${(!oldFile || !newFile || status === 'comparing')
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              <Download className="w-5 h-5" />
              Compare and Download Results
            </button>
          </div>

          <ComparisonTable results={results} />
        </div>
      </div>
    </div>
  );
}

export default App;