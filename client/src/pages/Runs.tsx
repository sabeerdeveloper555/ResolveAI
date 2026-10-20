import { PlayCircle } from 'lucide-react';
import { ComingSoonPage } from '@/components/ComingSoonPage';

function Runs() {
  return (
    <ComingSoonPage
      title="Runs"
      description="Monitor every workflow execution with logs, timing and outcomes."
      icon={PlayCircle}
      planned={[
        'Full run history with filters',
        'Per-step execution logs',
        'Live run streaming',
        'Manual and bulk retries',
      ]}
    />
  );
}

export default Runs;
