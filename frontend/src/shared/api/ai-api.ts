import { fetchServerSentEvents, type ConnectionAdapter } from "@tanstack/ai-react";
import { baseURL } from "./apiClient";

const apiUrl = baseURL + '/chat';

export function chatConnection(): ConnectionAdapter {
  return fetchServerSentEvents(apiUrl, { 
    credentials: 'include'
  })
}