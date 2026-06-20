export interface ArchNode {
  id: string;
  label: string;
  type: 'client' | 'network' | 'server' | 'database' | 'external';
  description: string;
  responsibility: string[];
  techUsed: string;
  configTip: string;
}

export interface DatabaseField {
  name: string;
  type: string;
  isPrimary?: boolean;
  isUnique?: boolean;
  isNullable?: boolean;
  relationTo?: string;
  description: string;
}

export interface DatabaseModel {
  name: string;
  description: string;
  fields: DatabaseField[];
  indexes: string[];
}

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  description: string;
  children?: FileNode[];
  codeSample?: string;
}

export interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  summary: string;
  description: string;
  tags: string[];
  requestHeaders?: { name: string; type: string; required: boolean; description: string; defaultValue?: string }[];
  requestBody?: {
    contentType: string;
    schema: Record<string, { type: string; required: boolean; description: string; example: any }>;
  };
  responses: {
    status: number;
    description: string;
    example: any;
  }[];
  simulationHandler: (input: any) => { status: number; body: any };
}

export interface SecurityCheckItem {
  id: string;
  title: string;
  category: 'Cryptography' | 'Session' | 'Network' | 'Database' | 'Logging';
  vulnerability: string;
  bestPractice: string;
  codeSnippet: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface RoadmapPhase {
  phase: number;
  title: string;
  duration: string;
  description: string;
  tasks: { title: string; desc: string; completedByDefault: boolean }[];
  deliverables: string[];
}
