'use client';

import { useParams } from 'next/navigation';
import { Wiki } from '@/components/wiki/Wiki';

export default function WikiPage() {
  const params = useParams();
  const projetoId = params.id as string;

  return <Wiki projetoId={projetoId} />;
}
