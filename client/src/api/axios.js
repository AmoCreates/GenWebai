import axios from 'axios';

const API = axios.create({
  // This automatically picks the right URL based on the environment
  baseURL: import.meta.env.VITE_API_URL,
});

// You can also add interceptors here for tokens/auth later
export default API;
