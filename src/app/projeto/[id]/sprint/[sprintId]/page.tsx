'use client';

import { useParams } from 'next/navigation';
import { SprintTaskboard } from '@/components/scrum/SprintTaskboard';

export default function SprintPage() {
  const params = useParams();
  const projetoId = params.id as string;
  const sprintId = params.sprintId as string;

  return <SprintTaskboard sprintId={sprintId} projetoId={projetoId} />;
}
