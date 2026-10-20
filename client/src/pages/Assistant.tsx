import { Bot } from 'lucide-react';
import { ComingSoonPage } from '@/components/ComingSoonPage';

function Assistant() {
  return (
    <ComingSoonPage
      title="AI Assistant"
      description="Describe an outcome and let AI plan the workflow steps for it."
      icon={Bot}
      planned={[
        'Chat-based workflow planning',
        'Step-by-step plan proposals you can edit',
        'Natural-language run history questions',
        'Suggestions for failures and retries',
      ]}
    />
  );
}

export default Assistant;
