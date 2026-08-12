import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadImages = async (files, onUploadProgress) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
  return response.data;
};

export const predict = async (sequence = null) => {
  const payload = sequence ? { sequence } : {};
  const response = await api.post('/predict', payload);
  return response.data;
};

export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
