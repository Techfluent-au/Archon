// src/pages/ChatPage.tsx
/**
 * 🎯 PRIMARY CHAT PAGE COMPONENT
 * Orchestrates the entire chat experience with agent selection and conversation management
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ChatContainer } from '../components/chat/ChatContainer';
import { AgentSelector } from '../components/chat/AgentSelector';
import { ConversationHistory } from '../components/chat/ConversationHistory';
import { ChatSettings } from '../components/chat/ChatSettings';
import { Agent } from '../../types/Agent';
import { Conversation } from '../../types/Chat';
import { UserSettings } from '../../types/UserSettings';

export const ChatPage: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserSettings>({});

  const handleNewMessage = (message: any) => {
    // TODO: Implement this
    console.log('New message:', message);
  };

  const handleSettingsChange = (settings: any) => {
    // TODO: Implement this
    console.log('Settings changed:', settings);
  };

  // Chat page layout following Archon's design patterns
  return (
    <div className="chat-page-container">
      <div className="chat-sidebar">
        <AgentSelector
          agents={availableAgents}
          selectedAgent={selectedAgent}
          onAgentSelect={setSelectedAgent}
        />
        <ConversationHistory
          conversations={conversations}
          activeId={activeConversation}
          onConversationSelect={setActiveConversation}
        />
      </div>

      <div className="chat-main">
        <ChatContainer
          agent={selectedAgent}
          conversationId={activeConversation}
          onNewMessage={handleNewMessage}
        />
      </div>

      <div className="chat-settings">
        <ChatSettings
          preferences={userPreferences}
          onSettingsChange={handleSettingsChange}
        />
      </div>
    </div>
  );
};
