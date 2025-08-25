// archon-ui-main/src/components/chat/TypingIndicator.tsx
import React from 'react';

// Placeholder type
interface Agent {
  id: string;
  name: string;
  type: string;
}

interface TypingIndicatorProps {
  agent: Agent | null;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ agent }) => {
  return (
    <div className="typing-indicator">
      <div className="typing-dots">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
      <span>{agent ? `${agent.name} is typing...` : 'Assistant is typing...'}</span>
    </div>
  );
};
