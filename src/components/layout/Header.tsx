'use client';

import Link from 'next/link';
import { FolderKanban, HelpCircle, Bell, User } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { usuarioAtual } = useAppStore();

  return (
    <header
      className={cn(
        'h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4',
        className
      )}
    >
      {/* Logo e Link para Projetos */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-600 hover:text-primary-500 transition-colors"
        >
          <FolderKanban className="w-5 h-5" />
          <span className="text-sm font-medium">Projetos</span>
        </Link>
      </div>

      {/* Ações do usuário */}
      <div className="flex items-center gap-2">
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        
        {/* Avatar do usuário */}
        <button className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-full transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
            {usuarioAtual?.nome?.charAt(0).toUpperCase() || 'U'}
          </div>
        </button>
      </div>
    </header>
  );
}
