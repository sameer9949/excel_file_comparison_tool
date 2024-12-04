import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  label: string;
}

export function FileUpload({ onFileSelect, label }: FileUploadProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    onDrop: files => {
      if (files[0]) {
        onFileSelect(files[0]);
      }
    }
  });

  return (
    <div
      {...getRootProps()}
      className={`p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        <Upload className="w-8 h-8 text-gray-400" />
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-xs text-gray-500">Drop your Excel file here or click to browse</p>
      </div>
    </div>
  );
}