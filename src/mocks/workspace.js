import { daysAgo, hoursAgo, minutesAgo } from './time';

export const workspaces = [
  { id: 'ws_acme', name: 'Acme Inc', plan: 'Business' },
  { id: 'ws_globex', name: 'Globex Support', plan: 'Starter' },
];

export const roles = [
  { id: 'owner', name: 'Owner', description: 'Full access, including billing and workspace deletion.', locked: true },
  { id: 'admin', name: 'Admin', description: 'Manage settings, members, widgets and websites.' },
  { id: 'supervisor', name: 'Supervisor', description: 'Manage conversations and agents within their teams.' },
  { id: 'agent', name: 'Agent', description: 'Handle assigned and unassigned conversations.' },
  { id: 'viewer', name: 'Viewer', description: 'Read-only access to conversations and reports.' },
];

export const permissions = [
  { id: 'conversations.reply', label: 'Reply to conversations', group: 'Conversations' },
  { id: 'conversations.assign', label: 'Assign conversations', group: 'Conversations' },
  { id: 'conversations.delete', label: 'Delete conversations', group: 'Conversations' },
  { id: 'visitors.view', label: 'View live visitors', group: 'Visitors' },
  { id: 'canned.manage', label: 'Manage shared canned responses', group: 'Content' },
  { id: 'widgets.manage', label: 'Manage widgets & websites', group: 'Configuration' },
  { id: 'members.manage', label: 'Invite and manage members', group: 'Administration' },
  { id: 'settings.manage', label: 'Manage workspace settings', group: 'Administration' },
  { id: 'billing.manage', label: 'Manage billing', group: 'Administration' },
];

export const rolePermissions = {
  owner: permissions.map((p) => p.id),
  admin: ['conversations.reply', 'conversations.assign', 'conversations.delete', 'visitors.view', 'canned.manage', 'widgets.manage', 'members.manage', 'settings.manage'],
  supervisor: ['conversations.reply', 'conversations.assign', 'visitors.view', 'canned.manage'],
  agent: ['conversations.reply', 'visitors.view'],
  viewer: ['visitors.view'],
};

export const teams = [
  { id: 'support', name: 'Customer Support', description: 'First-line support for all customers', color: 'brand', memberIds: ['u_1', 'u_2', 'u_4', 'u_9', 'u_12', 'u_13', 'u_17'] },
  { id: 'technical', name: 'Technical', description: 'Integrations, API and escalated issues', color: 'cyan', memberIds: ['u_3', 'u_6', 'u_11', 'u_14', 'u_18'] },
  { id: 'billing', name: 'Billing', description: 'Invoices, refunds and plan changes', color: 'green', memberIds: ['u_5', 'u_10', 'u_15'] },
  { id: 'sales', name: 'Sales', description: 'Pre-sales questions and demos', color: 'orange', memberIds: ['u_7', 'u_8', 'u_16'] },
];

export const workspaceSettings = {
  general: {
    name: 'Acme Inc',
    subdomain: 'acme',
    supportEmail: 'support@acme.io',
    website: 'https://acme.io',
    industry: 'saas',
    companySize: '51-200',
    logo: null,
  },
  info: {
    id: 'ws_8f3k2m9q',
    plan: 'Business',
    region: 'US East (Virginia)',
    createdAt: daysAgo(612),
    seats: { used: 16, total: 25 },
    conversations: { used: 18240, total: 30000 },
  },
  businessHours: {
    enabled: true,
    timezone: 'America/New_York',
    days: [
      { day: 'Monday', open: true, from: '09:00', to: '18:00' },
      { day: 'Tuesday', open: true, from: '09:00', to: '18:00' },
      { day: 'Wednesday', open: true, from: '09:00', to: '18:00' },
      { day: 'Thursday', open: true, from: '09:00', to: '18:00' },
      { day: 'Friday', open: true, from: '09:00', to: '17:00' },
      { day: 'Saturday', open: false, from: '10:00', to: '14:00' },
      { day: 'Sunday', open: false, from: '10:00', to: '14:00' },
    ],
    awayMessage: "Thanks for reaching out! We're currently offline and will reply as soon as we're back during business hours.",
  },
  localization: {
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MMM D, YYYY',
    timeFormat: '12h',
    weekStart: 'monday',
  },
  notifications: {
    newConversation: { email: false, push: true, desktop: true },
    assignedToMe: { email: true, push: true, desktop: true },
    newMessage: { email: false, push: true, desktop: true },
    mention: { email: true, push: true, desktop: true },
    slaBreach: { email: true, push: true, desktop: false },
    dailyDigest: { email: true, push: false, desktop: false },
  },
  security: {
    enforce2fa: true,
    sso: false,
    sessionTimeout: '7d',
    passwordPolicy: 'strong',
    ipAllowlist: ['203.0.113.0/24'],
    sessions: [
      { id: 's_1', device: 'MacBook Pro · Chrome 131', location: 'San Francisco, US', ip: '203.0.113.24', lastActiveAt: minutesAgo(0), current: true },
      { id: 's_2', device: 'iPhone 15 · Chat Model iOS', location: 'San Francisco, US', ip: '198.51.100.12', lastActiveAt: hoursAgo(2) },
      { id: 's_3', device: 'Windows 11 · Edge 130', location: 'Austin, US', ip: '192.0.2.88', lastActiveAt: daysAgo(4) },
    ],
  },
};

export const timezones = [
  'America/Los_Angeles', 'America/Chicago', 'America/New_York', 'America/Sao_Paulo', 'Europe/London', 'Europe/Paris',
  'Europe/Berlin', 'Europe/Madrid', 'Europe/Istanbul', 'Africa/Lagos', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo',
  'Asia/Seoul', 'Australia/Sydney',
];

export const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ja', label: 'Japanese' },
];

export const notifications = [
  { id: 'n_1', title: 'New conversation assigned', body: 'Marcus Chen was assigned to you', at: minutesAgo(3), read: false, href: '/chat/c_1' },
  { id: 'n_2', title: 'SLA at risk', body: 'Reply to Olivia Park within 5 minutes', at: minutesAgo(12), read: false, href: '/chat/c_2' },
  { id: 'n_3', title: 'Priya mentioned you', body: '"@Sarah can you approve this refund?"', at: hoursAgo(1), read: false, href: '/chat/c_5' },
  { id: 'n_4', title: 'Website verified', body: 'docs.acme.io is now connected', at: hoursAgo(5), read: true, href: '/website' },
  { id: 'n_5', title: 'Invitation accepted', body: 'Yusuf Demir joined the workspace', at: daysAgo(1), read: true, href: '/users' },
];
