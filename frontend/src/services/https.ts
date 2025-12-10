import axios from "axios";

export const http = axios.create({
  baseURL: "/", // we'll call /api/... and Vite proxies to http://localhost:4002
});
