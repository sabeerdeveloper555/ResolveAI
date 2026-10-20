import {
  BookOpen,
  Bot,
  LayoutDashboard,
  Plug,
  PlayCircle,
  Settings,
  Workflow,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface NavGroup {
  heading: string;
  items: NavItem[];
}

// Single source of truth for sidebar links, header titles and page metadata.
export const navGroups: NavGroup[] = [
  {
    heading: 'Overview',
    items: [
      {
        to: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        title: 'Dashboard',
        description: 'Your workspace at a glance.',
      },
    ],
  },
  {
    heading: 'Automate',
    items: [
      {
        to: '/workflows',
        label: 'Workflows',
        icon: Workflow,
        title: 'Workflows',
        description: 'Design and manage your automated workflows.',
      },
      {
        to: '/assistant',
        label: 'AI Assistant',
        icon: Bot,
        title: 'AI Assistant',
        description: 'Plan and generate workflows with AI.',
      },
      {
        to: '/runs',
        label: 'Runs',
        icon: PlayCircle,
        title: 'Runs',
        description: 'Monitor workflow execution history.',
      },
    ],
  },
  {
    heading: 'Manage',
    items: [
      {
        to: '/knowledge',
        label: 'Knowledge Base',
        icon: BookOpen,
        title: 'Knowledge Base',
        description: 'Documents and context for your workflows.',
      },
      {
        to: '/integrations',
        label: 'Integrations',
        icon: Plug,
        title: 'Integrations',
        description: 'Connect the tools your workflows act on.',
      },
      {
        to: '/settings',
        label: 'Settings',
        icon: Settings,
        title: 'Settings',
        description: 'Workspace preferences and configuration.',
      },
    ],
  },
];

// Flattened lookup used by the header and page titles.
export const navItems: NavItem[] = navGroups.flatMap((group) => group.items);

export const workspaceName = 'Acme Workspace';
export const userName = 'Sabeer Alam';
export const userInitials = 'SA';
export const userRole = 'Workspace owner';
