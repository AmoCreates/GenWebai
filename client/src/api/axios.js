import axios from 'axios';

const API = axios.create({
  // This automatically picks the right URL based on the environment
  baseURL: "https://genwebai-1jh4.onrender.com",
});

// You can also add interceptors here for tokens/auth later
export default API;
