
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 120000,
});

export const uploadImages = async (files, onUploadProgress) => {
  if (!files || files.length !== 5) {
    throw new Error('Please select exactly five thermal TIFF images.');
  }

  const formData = new FormData();

  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await api.post('/upload', formData, {
    onUploadProgress,
  });

  return response.data;
};

export const predict = async (sequence = '') => {
  const response = await api.post('/predict', {
    sequence: sequence || '',
  });

  return response.data;
};

export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
