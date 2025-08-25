import React, { useState, useRef, useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { useChatStream } from '../../hooks/useChatStream';
import { Agent } from '../../types/Agent';
import { Message } from '../../types/Chat';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const ChatContainer: React.FC<{
  agent: Agent | null;
  conversationId: string | null;
  onNewMessage: (message: Message) => void;
}> = ({ agent, conversationId, onNewMessage }) => {

  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleStreamChunk = (chunk: string) => {
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage?.role === 'assistant' && lastMessage.agent?.id === agent?.id) {
        // Update existing streaming message
        return prev.map((msg, index) =>
          index === prev.length - 1
            ? { ...msg, content: msg.content + chunk }
            : msg
        );
      } else {
        // Create new streaming message
        const streamingMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: chunk,
          timestamp: new Date(),
          agent
        };
        return [...prev, streamingMessage];
      }
    });
  };

  const handleStreamComplete = (fullResponse: string) => {
    // TODO: Implement
    console.log("Stream complete:", fullResponse);
  }

  const handleStreamError = (error: Error) => {
    // TODO: Implement
    console.error("Stream error:", error);
  }

  // Custom hook for handling streaming chat responses
  const { sendMessage, isLoading } = useChatStream({
    agent,
    conversationId,
    onChunk: handleStreamChunk,
    onComplete: handleStreamComplete,
    onError: handleStreamError
  });

  const handleSendMessage = async (content: string) => {
    if (!agent) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
      agent
    };

    setMessages(prev => [...prev, userMessage]);
    onNewMessage(userMessage);

    // Send to LLM with streaming response
    await sendMessage(content);
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        {agent && (
          <div className="active-agent-info">
            <span className="agent-name">{agent.name}</span>
            <span className="agent-type">{agent.type}</span>
          </div>
        )}
      </div>

      <div className="chat-messages">
        <MessageList messages={messages} />
        {isLoading && <TypingIndicator agent={agent} />}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={!agent || isLoading}
          placeholder={agent ? `Message ${agent.name}...` : 'Select an agent to start chatting'}
        />
      </div>
    </div>
  );
};
