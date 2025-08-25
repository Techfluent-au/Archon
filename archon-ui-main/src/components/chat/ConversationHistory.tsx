// archon-ui-main/src/components/chat/ConversationHistory.tsx
import React from 'react';
import { Conversation } from '../../types/Chat';

interface ConversationHistoryProps {
  conversations: Conversation[];
  activeId: string | null;
  onConversationSelect: (id: string) => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({ conversations, activeId, onConversationSelect }) => {
  return (
    <div className="conversation-history">
      <h3>Conversation History</h3>
      <ul>
        {conversations.map((convo) => (
          <li
            key={convo.id}
            className={convo.id === activeId ? 'active' : ''}
            onClick={() => onConversationSelect(convo.id)}
          >
            Conversation {convo.id}
          </li>
        ))}
      </ul>
    </div>
  );
};
