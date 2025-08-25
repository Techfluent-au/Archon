import React, { useState } from 'react';
import { AgentCard } from './AgentCard';
import { Search } from 'lucide-react';
import { Agent } from '../../types/Agent';

interface AgentSelectorProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onAgentSelect: (agent: Agent) => void;
}

export const AgentSelector: React.FC<AgentSelectorProps> = ({
  agents,
  selectedAgent,
  onAgentSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<string>('all');

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'all' || agent.category === filterBy;
    return matchesSearch && matchesFilter;
  });

  const agentCategories = [...new Set(agents.map(agent => agent.category))];

  return (
    <div className="agent-selector">
      <div className="selector-header">
        <h3>Available Agents</h3>

        <div className="search-controls">
          <div className="search-input">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {agentCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="agents-grid">
        {filteredAgents.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            isSelected={selectedAgent?.id === agent.id}
            onSelect={() => onAgentSelect(agent)}
          />
        ))}
      </div>
    </div>
  );
};
