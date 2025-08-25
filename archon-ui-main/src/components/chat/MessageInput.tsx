// archon-ui-main/src/components/chat/MessageInput.tsx
import React, { useState } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled: boolean;
  placeholder: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled, placeholder }) => {
  const [content, setContent] = useState('');

  const handleSend = () => {
    if (content.trim()) {
      onSendMessage(content);
      setContent('');
    }
  };

  return (
    <div className="message-input">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        disabled={disabled}
        placeholder={placeholder}
      />
      <button onClick={handleSend} disabled={disabled}>Send</button>
    </div>
  );
};
