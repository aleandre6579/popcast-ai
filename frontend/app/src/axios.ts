import axios from 'axios';

const axiosReq = axios.create({
  baseURL: 'http://localhost/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosReq;
