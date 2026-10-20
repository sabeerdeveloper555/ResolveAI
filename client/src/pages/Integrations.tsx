import { Plug } from 'lucide-react';
import { ComingSoonPage } from '@/components/ComingSoonPage';

function Integrations() {
  return (
    <ComingSoonPage
      title="Integrations"
      description="Connect the tools your workflows read from and act on."
      icon={Plug}
      planned={[
        'OAuth connections to common apps',
        'Trigger sources (events, webhooks)',
        'Action catalog used by workflow steps',
        'Connection health and scope review',
      ]}
    />
  );
}

export default Integrations;
