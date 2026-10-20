import { BookOpen } from 'lucide-react';
import { ComingSoonPage } from '@/components/ComingSoonPage';

function Knowledge() {
  return (
    <ComingSoonPage
      title="Knowledge Base"
      description="Store the documents and context your AI steps can reason over."
      icon={BookOpen}
      planned={[
        'Document upload and indexing',
        'Collections per workspace or project',
        'Retrieval for AI workflow steps',
        'Citations in AI answers',
      ]}
    />
  );
}

export default Knowledge;
