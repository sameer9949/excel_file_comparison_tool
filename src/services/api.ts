import axios, { AxiosError } from 'axios';
import { ComparisonResult } from '../types/comparison';
import { API_CONFIG } from '../config/api.config';

const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Accept': 'application/json, application/octet-stream',
  }
});

export class ApiError extends Error {
  constructor(
    message: string, 
    public statusCode?: number,
    public details?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const handleAxiosError = (error: AxiosError): never => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const message = error.response.data instanceof Blob
      ? 'Server error: Invalid response format'
      : typeof error.response.data === 'string'
        ? error.response.data
        : 'Server error: Please try again';
    
    throw new ApiError(message, error.response.status);
  } else if (error.request) {
    // The request was made but no response was received
    throw new ApiError(
      'Unable to reach the server. Please check your connection.',
      0,
      'Network Error'
    );
  }
  // Something happened in setting up the request that triggered an Error
  throw new ApiError('Failed to send request. Please try again.');
};

export async function compareExcelFiles(oldFile: File, newFile: File): Promise<Blob> {
  try {
    // Validate file types
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(oldFile.type) || !validTypes.includes(newFile.type)) {
      throw new ApiError('Please upload valid Excel files (.xls or .xlsx)');
    }

    const formData = new FormData();
    formData.append('oldfile', oldFile);
    formData.append('newfile', newFile);

    const response = await api.post(API_CONFIG.endpoints.compareExcel, formData, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      validateStatus: (status) => status === 200,
    });

    // Verify the response is an Excel file
    if (response.headers['content-type']?.includes('spreadsheet')) {
      return response.data;
    }
    
    throw new ApiError('Invalid response format from server');
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof AxiosError) {
      handleAxiosError(error);
    }
    throw new ApiError('An unexpected error occurred while comparing files');
  }
}

export async function getComparisonResults(oldFile: File, newFile: File): Promise<ComparisonResult[]> {
  try {
    const formData = new FormData();
    formData.append('oldfile', oldFile);
    formData.append('newfile', newFile);

    const response = await api.post(API_CONFIG.endpoints.compare, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      validateStatus: (status) => status === 200,
    });

    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof AxiosError) {
      handleAxiosError(error);
    }
    throw new ApiError('An unexpected error occurred while fetching comparison results');
  }
}