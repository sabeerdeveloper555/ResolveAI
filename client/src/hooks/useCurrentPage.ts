import { useLocation, matchPath } from 'react-router-dom';
import { navItems, type NavItem } from '@/lib/navigation';

// Resolves the current page's metadata from the nav config so the header and
// pages don't duplicate title strings. Falls back to a generic label for
// routes not present in the sidebar (e.g. /workflows/new).
export function useCurrentPage(): NavItem {
  const { pathname } = useLocation();

  const exact = navItems.find((item) => item.to === pathname);
  if (exact) return exact;

  const partial = navItems.find((item) =>
    matchPath({ path: `${item.to}/*`, end: true }, pathname),
  );
  if (partial) return partial;

  return {
    to: pathname,
    label: 'Page',
    icon: navItems[0].icon,
    title: 'ResolveAI',
    description: '',
  };
}
