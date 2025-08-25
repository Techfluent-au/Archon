// Backend API integration for chat functionality
// src/api/chatApi.ts

/**
 * 🔌 CHAT API INTEGRATION
 * Handle communication with various LLM providers and agent backends
 */
import { Agent } from '../types/Agent';
import { Conversation } from '../types/Chat';


interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatRequest {
  message: string;
  agent: Agent;
  conversationId?: string;
  context?: ChatMessage[];
}

class ChatAPI {
  private baseURL = process.env.VITE_API_BASE_URL || '/api';

  async sendMessage(request: ChatRequest): Promise<Response> {
    return fetch(`${this.baseURL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify(request),
    });
  }

  async getConversations(): Promise<Conversation[]> {
    const response = await fetch(`${this.baseURL}/conversations`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });
    return response.json();
  }

  async getAgents(): Promise<Agent[]> {
    const response = await fetch(`${this.baseURL}/agents`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });
    return response.json();
  }

  private getAuthToken(): string {
    // Integrate with existing Archon auth system
    return localStorage.getItem('authToken') || '';
  }
}

export const chatAPI = new ChatAPI();
