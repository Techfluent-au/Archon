// archon-ui-main/src/types/Agent.ts
export interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  avatar?: React.ReactNode;
  capabilities: string[];
  isOnline: boolean;
  type: string; // From ChatContainer
}
