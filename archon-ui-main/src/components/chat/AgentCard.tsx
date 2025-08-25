import React from 'react';
import { Bot } from 'lucide-react';
import { Agent } from '../../types/Agent';

export const AgentCard: React.FC<{
  agent: Agent;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ agent, isSelected, onSelect }) => (
  <div
    className={`agent-card ${isSelected ? 'selected' : ''}`}
    onClick={onSelect}
  >
    <div className="agent-avatar">
      {agent.avatar || <Bot size={24} />}
    </div>

    <div className="agent-info">
      <h4 className="agent-name">{agent.name}</h4>
      <p className="agent-description">{agent.description}</p>

      <div className="agent-capabilities">
        {agent.capabilities.slice(0, 3).map(capability => (
          <span key={capability} className="capability-tag">
            {capability}
          </span>
        ))}
      </div>

      <div className="agent-status">
        <span className={`status-indicator ${agent.isOnline ? 'online' : 'offline'}`} />
        {agent.isOnline ? 'Available' : 'Offline'}
      </div>
    </div>
  </div>
);
