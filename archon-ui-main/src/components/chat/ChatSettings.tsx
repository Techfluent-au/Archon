// archon-ui-main/src/components/chat/ChatSettings.tsx
import React from 'react';
import { UserSettings } from '../../types/UserSettings';

interface ChatSettingsProps {
  preferences: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
}

export const ChatSettings: React.FC<ChatSettingsProps> = ({ preferences, onSettingsChange }) => {
  return (
    <div className="chat-settings">
      <h3>Chat Settings</h3>
      {/* Settings controls will go here */}
      <p>Settings will be available soon.</p>
    </div>
  );
};
