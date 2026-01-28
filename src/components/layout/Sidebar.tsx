'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ListTodo,
  AlertCircle,
  BookOpen,
  Search,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FolderKanban,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { useHydration } from '@/lib/useHydration';

interface SidebarProps {
  projetoId?: string;
}

export function Sidebar({ projetoId }: SidebarProps) {
  const pathname = usePathname();
  const hydrated = useHydration();
  const [collapsed, setCollapsed] = useState(false);
  const [scrumExpanded, setScrumExpanded] = useState(true);
  
  const { getProjetoAtual, getSprintsPorProjeto } = useAppStore();
  const projeto = hydrated ? getProjetoAtual() : null;
  const sprints = hydrated && projetoId ? getSprintsPorProjeto(projetoId) : [];

  const menuItems = [
    {
      id: 'scrum',
      label: 'Scrum',
      icon: LayoutDashboard,
      expandable: true,
      children: [
        { id: 'backlog', label: 'Backlog', href: `/projeto/${projetoId}/backlog` },
        ...sprints.map((sprint) => ({
          id: sprint.id,
          label: sprint.nome,
          href: `/projeto/${projetoId}/sprint/${sprint.id}`,
        })),
      ],
    },
    {
      id: 'issues',
      label: 'Issues',
      icon: AlertCircle,
      href: `/projeto/${projetoId}/issues`,
    },
    {
      id: 'wiki',
      label: 'Wiki',
      icon: BookOpen,
      href: `/projeto/${projetoId}/wiki`,
    },
  ];

  const timelineItem = {
    id: 'timeline',
    label: 'Timeline',
    icon: Activity,
    href: `/projeto/${projetoId}/timeline`,
  };

  const bottomItems = [
    { id: 'search', label: 'Buscar', icon: Search, href: `/projeto/${projetoId}/buscar` },
    { id: 'team', label: 'Equipe', icon: Users, href: `/projeto/${projetoId}/equipe` },
    { id: 'settings', label: 'Configurações', icon: Settings, href: `/projeto/${projetoId}/configuracoes` },
  ];

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-sidebar text-white flex flex-col z-50 transition-all duration-300',
        collapsed ? 'w-16' : 'w-44'
      )}
    >
      {/* Logo / Nome do Projeto */}
      <Link
        href={projetoId ? `/projeto/${projetoId}/timeline` : '/'}
        className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-light hover:bg-sidebar-light transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
          <FolderKanban className="w-5 h-5" />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold truncate">
            {projeto?.nome || 'Projetos'}
          </span>
        )}
      </Link>

      {/* Menu Principal */}
      <nav className="flex-1 overflow-y-auto py-2">
        {menuItems.map((item) => (
          <div key={item.id}>
            {item.expandable ? (
              <>
                <button
                  onClick={() => setScrumExpanded(!scrumExpanded)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-sidebar-light hover:text-white transition-colors',
                    collapsed && 'justify-center'
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {scrumExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </>
                  )}
                </button>
                {scrumExpanded && !collapsed && item.children && (
                  <div className="bg-sidebar-dark">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        className={cn(
                          'flex items-center gap-3 pl-12 pr-4 py-2 text-xs text-gray-400 hover:bg-sidebar-light hover:text-white transition-colors',
                          pathname === child.href && 'bg-primary-500 text-white'
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href || '#'}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-sidebar-light hover:text-white transition-colors',
                  pathname === item.href && 'bg-primary-500 text-white',
                  collapsed && 'justify-center'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )}
          </div>
        ))}

        {/* Timeline */}
        <Link
          href={timelineItem.href}
          className={cn(
            'flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-sidebar-light hover:text-white transition-colors',
            pathname === timelineItem.href && 'bg-primary-500 text-white',
            collapsed && 'justify-center'
          )}
        >
          <timelineItem.icon className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>{timelineItem.label}</span>}
        </Link>
      </nav>

      {/* Menu Inferior */}
      <div className="border-t border-sidebar-light py-2">
        {bottomItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-sidebar-light hover:text-white transition-colors',
              pathname === item.href && 'bg-primary-500 text-white',
              collapsed && 'justify-center'
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </div>

      {/* Botão Colapsar */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 px-4 py-3 text-xs text-gray-400 hover:bg-sidebar-light hover:text-white transition-colors border-t border-sidebar-light"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 mx-auto" />
        ) : (
          <>
            <ChevronLeft className="w-4 h-4" />
            <span>recolher menu</span>
          </>
        )}
      </button>
    </aside>
  );
}
