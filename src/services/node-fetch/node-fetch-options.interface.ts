import { RequestInit } from "node-fetch";

export interface NodeFetchOptions extends RequestInit {
  url?: string;
  baseURL?: string;
  query?: object;
  timeout?: number
}
