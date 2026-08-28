import axios from 'axios'

export const aiApiClient = axios.create({
  baseURL: import.meta.env.VITE_AI_API_URL ?? 'http://aibot-server.vercel.app',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

aiApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

aiApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized request to the AI API')
    }

    return Promise.reject(error)
  },
)

export default aiApiClient
