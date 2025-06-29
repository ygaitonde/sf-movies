import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export class APIClient {
  private client: AxiosInstance;

  constructor(baseURL?: string, timeout: number = 10000) {
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('Response interceptor error:', error.response?.status, error.message);
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  setHeader(key: string, value: string) {
    this.client.defaults.headers.common[key] = value;
  }

  removeHeader(key: string) {
    delete this.client.defaults.headers.common[key];
  }
}

export const createAPIClient = (baseURL?: string) => new APIClient(baseURL);