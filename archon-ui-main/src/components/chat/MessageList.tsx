// archon-ui-main/src/components/chat/MessageList.tsx
import React from 'react';
import { Message } from '../../types/Chat';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="message-list">
      {messages.map((message) => (
        <div key={message.id} className={`message ${message.role}`}>
          <div className="message-content">{message.content}</div>
        </div>
      ))}
    </div>
  );
};
