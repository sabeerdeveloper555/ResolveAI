import { Settings as SettingsIcon } from 'lucide-react';
import { ComingSoonPage } from '@/components/ComingSoonPage';

function Settings() {
  return (
    <ComingSoonPage
      title="Settings"
      description="Workspace preferences, members and API configuration."
      icon={SettingsIcon}
      planned={[
        'Workspace profile and plan details',
        'Member management and roles',
        'API keys and webhook secrets',
        'Notification preferences',
      ]}
    />
  );
}

export default Settings;
