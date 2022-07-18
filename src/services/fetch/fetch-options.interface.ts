
export interface FetchOptions extends RequestInit {
  url?: string;
  baseURL?: string;
  query?: object;
  timeout?: number
}
