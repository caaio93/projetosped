'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { IssueDetail } from '@/components/issues/IssueDetail';

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projetoId = params.id as string;
  const issueId = params.issueId as string;

  const { issues } = useAppStore();
  const issue = issues.find((i) => i.id === issueId);

  if (!issue) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Issue não encontrada</div>
      </div>
    );
  }

  return (
    <IssueDetail 
      issue={issue} 
      onClose={() => router.push(`/projeto/${projetoId}/issues`)} 
    />
  );
}
