import { WandSparkles } from 'lucide-react';
import { ComingSoonPage } from '@/components/ComingSoonPage';

function NewWorkflow() {
  return (
    <ComingSoonPage
      title="New Workflow"
      description="Start a workflow from a blank canvas or describe it to the AI Assistant."
      icon={WandSparkles}
      planned={[
        'Visual drag-and-drop workflow canvas',
        'AI-generated step plans from a plain-language goal',
        'Trigger picker (schedule, webhook, app events)',
        'Step library: tools, conditionals, AI actions',
        'Draft saving and versioning',
      ]}
    />
  );
}

export default NewWorkflow;
