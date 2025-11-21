import { DocumentData, Group, Message, HistoryItem, ChatMember } from './types';

export const MOCK_DOCS: DocumentData[] = [
  {
    id: 'doc-fanuc',
    title: 'FANUC Robot Series R-30iB Mate + Mate Plus Maintenance Manual',
    ownerId: 'user-1',
    ownerName: 'Current User',
    isPublic: true,
    uploadDate: '2023-11-22',
    fileSize: '12.5 MB',
    type: 'Maintenance Manual',
    summary: 'Comprehensive maintenance manual for R-30iB Mate/Mate Plus controllers. Covers safety protocols, troubleshooting, component replacement, and connection diagrams.',
    content: [
      "1. Overview: This manual describes the maintenance and connection of R-30iB Mate/ R-30iB Mate Plus.",
      "2. Safety: Safety is essential whenever robots are used. Keep in mind the following factors with regard to safety: The safety of people and equipment, Use of safety enhancing devices.",
      "3. Troubleshooting: This chapter describes the checking method and corrective action for each alarm code indicated if a hardware alarm occurs.",
      "4. Replacing Units: This section explains how to replace each unit in the control section. Before you start to replace a unit, turn off the controller main power."
    ]
  },
  {
    id: 'doc-1',
    title: 'Project Omega Technical Manual',
    ownerId: 'user-1',
    ownerName: 'Current User',
    isPublic: true,
    uploadDate: '2023-10-15',
    fileSize: '2.4 MB',
    type: 'Technical Specification',
    summary: 'Overview of the Omega propulsion system standards and safety protocols.',
    content: [
      "1. Introduction: The Omega Propulsion System is designed for high-efficiency orbital transfers.",
      "2. Safety Protocols: All operators must wear Class-4 hazmat suits when handling the fuel cells.",
      "3. Maintenance: The core cylinder requires flushing every 400 operational hours to prevent residue buildup.",
      "4. Emergency Procedures: In case of containment breach, initiate Sequence Alpha immediately.",
      "5. Legal: Use of this technology is restricted to licensed entities under the Galactic Trade Agreement."
    ]
  },
  {
    id: 'doc-2',
    title: 'Q3 Financial Report 2023',
    ownerId: 'user-2',
    ownerName: 'Jane Doe',
    isPublic: true,
    uploadDate: '2023-11-01',
    fileSize: '1.1 MB',
    type: 'Financial Audit',
    summary: 'Quarterly earnings breakdown and projection for Q4.',
    content: [
      "Executive Summary: Q3 saw a 15% increase in net revenue due to market expansion.",
      "Expenses: Operational costs rose by 5% attributed to new hiring initiatives.",
      "Forecast: We project a flat Q4 due to seasonal supply chain constraints."
    ]
  },
  {
    id: 'doc-3',
    title: 'Internal Security Protocols v9',
    ownerId: 'user-1',
    ownerName: 'Admin',
    isPublic: false,
    uploadDate: '2023-11-10',
    fileSize: '4.5 MB',
    type: 'Confidential',
    summary: 'Restricted access security protocols for site B.',
    content: ["CONFIDENTIAL: Level 5 Clearance Required."]
  }
];

export const MOCK_GROUPS: Group[] = [
  {
    id: 'g-fanuc',
    name: 'FANUC R-30iB Maintenance',
    description: 'Discussion for troubleshooting and maintaining R-30iB controllers.',
    members: 156,
    active: true,
    relatedDocId: 'doc-fanuc',
    relatedDocTitle: 'FANUC Robot Series R-30iB Mate + Mate Plus Maintenance Manual',
    type: 'public',
    tags: ['robotics', 'maintenance', 'fanuc']
  },
  { 
    id: 'g-1', 
    name: 'Omega Tech Spec Review', 
    description: 'Deep dive into the propulsion safety protocols and maintenance cycles.', 
    members: 12, 
    active: true,
    relatedDocId: 'doc-1',
    relatedDocTitle: 'Project Omega Technical Manual',
    type: 'public',
    tags: ['technical', 'omega', 'safety']
  },
  { 
    id: 'g-2', 
    name: 'Q3 Audit Compliance', 
    description: 'Checking Q3 figures against the new federal tax guidelines.', 
    members: 8, 
    active: true,
    relatedDocId: 'doc-2',
    relatedDocTitle: 'Q3 Financial Report 2023',
    type: 'public',
    tags: ['finance', 'audit']
  },
  { 
    id: 'g-4', 
    name: 'Board Meeting Prep', 
    description: 'Internal discussion for Q4 forecasting strategy.', 
    members: 4, 
    active: true, 
    relatedDocId: 'doc-2',
    relatedDocTitle: 'Q3 Financial Report 2023',
    type: 'private',
    orgName: 'Acme Corp',
    tags: ['finance', 'internal']
  }
];

export const MOCK_CHATS: Record<string, Message[]> = {
  'doc-fanuc': [
    { id: 'm1', sender: 'ai', text: 'Hello! I have indexed the FANUC R-30iB Maintenance Manual. You can ask about error codes, fuse replacements, or safety protocols.' },
    { id: 'm2', sender: 'user', text: 'What does the SRVO-001 alarm mean?' },
    { id: 'm3', sender: 'ai', text: 'SRVO-001 is the "Operator panel E-stop" alarm. It means the emergency stop button on the operator panel has been pressed.', referenceId: 2 }
  ],
  'doc-1': [
    { id: 'm1', sender: 'ai', text: 'Hello! I have analyzed "Project Omega Technical Manual". Ask me anything.' },
    { id: 'm2', sender: 'user', text: 'How often do I need to clean the cylinder?' },
    { id: 'm3', sender: 'ai', text: 'The core cylinder requires flushing every 400 operational hours.', referenceId: 2 }
  ]
};

export const MOCK_HISTORY: HistoryItem[] = [
  { id: 'h0', query: 'SRVO-001 error code', docTitle: 'FANUC R-30iB Maintenance', date: '10 mins ago', docId: 'doc-fanuc' },
  { id: 'h1', query: 'cleaning cycle frequency', docTitle: 'Project Omega Technical Manual', date: '2 hours ago', docId: 'doc-1' },
  { id: 'h2', query: 'revenue projections Q4', docTitle: 'Q3 Financial Report', date: '1 day ago', docId: 'doc-2' },
];

export const MOCK_CHAT_MEMBERS: ChatMember[] = [
  { id: 'u1', name: 'Sarah Connors', role: 'Safety Officer', status: 'online' },
  { id: 'u2', name: 'Mike Ross', role: 'Lead Engineer', status: 'away' },
  { id: 'u3', name: 'Jessica Pearson', role: 'Auditor', status: 'online' },
];