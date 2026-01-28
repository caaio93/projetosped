'use client';

import { useParams } from 'next/navigation';
import { IssuesList } from '@/components/issues/IssuesList';

export default function IssuesPage() {
  const params = useParams();
  const projetoId = params.id as string;

  return <IssuesList projetoId={projetoId} />;
}
