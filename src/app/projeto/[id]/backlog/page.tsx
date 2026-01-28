'use client';

import { useParams } from 'next/navigation';
import { Backlog } from '@/components/scrum/Backlog';

export default function BacklogPage() {
  const params = useParams();
  const projetoId = params.id as string;

  return <Backlog projetoId={projetoId} />;
}
