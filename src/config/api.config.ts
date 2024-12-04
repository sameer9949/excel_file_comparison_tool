export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  endpoints: {
    compareExcel: '/generate-excel-create',
    compare: '/compare'
  },
  timeout: 60000, // 60 seconds for large file uploads
  retries: 2
};