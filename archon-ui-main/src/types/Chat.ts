// archon-ui-main/src/types/Chat.ts
import { Agent } from './Agent';

export interface Conversation {
  id: string;
  // other properties...
}

export interface MessageMetadata {
  // empty for now
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agent?: Agent;
  metadata?: MessageMetadata;
}
