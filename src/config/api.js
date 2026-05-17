const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const API = {
  base: API_BASE_URL,
  ocr: `${API_BASE_URL}/api/v1/ocr`,
  bills: `${API_BASE_URL}/api/v1/bills`,
};
