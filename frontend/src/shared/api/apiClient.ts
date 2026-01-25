import axios from 'axios'

// import { useAuthStore } from '@/shared/stores/auth-store'

const isLocal = import.meta.env.VITE_ENV === 'local';
const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';
export const baseURL = isLocal ? '/api' : API_BASE_URL;

export const http = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',    
  },
})

// http.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const status = error.response?.status ?? 500
//     console.log('status', error, status);
//     if (status === 401 && typeof window !== 'undefined') {
//       queryClient.setQueryData(['me'], null);

//       const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
//       const isAlreadyOnLogin = window.location.pathname.includes('/login')
//       const redirectTarget =
//         !isAlreadyOnLogin && currentPath
//           ? `/login?from=${encodeURIComponent(currentPath)}`
//           : '/login'

//       if (!isAlreadyOnLogin) {
//         window.location.replace(redirectTarget)
//       }
//     }

//     const normalizedError = {
//       status,
//       message:
//         error.response?.data?.error ??
//         error.response?.data?.message ??
//         error.message ??
//         'Request failed',
//       data: error.response?.data,
//     }

//     return Promise.reject(normalizedError)
//   },
// )

// apiClient.interceptors.request.use((config) => {
//   const token = useAuthStore.getState().session?.token

//   if (token) {
//     config.headers = config.headers ?? {}
//     config.headers.Authorization = `Bearer ${token}`
//   }

//   return config
// })

export type HttpError = {
  status: number
  message: string
  data?: unknown
}