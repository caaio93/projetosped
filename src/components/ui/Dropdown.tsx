'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// ==========================================
// DROPDOWN BÁSICO
// ==========================================
interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, children, align = 'left', className }: DropdownProps) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setAberto(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <div onClick={() => setAberto(!aberto)}>{trigger}</div>
      {aberto && (
        <div
          className={cn(
            'absolute z-50 mt-1 min-w-[180px] bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-fade-in',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          onClick={() => setAberto(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ==========================================
// DROPDOWN ITEM
// ==========================================
interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  selected?: boolean;
}

export function DropdownItem({
  children,
  onClick,
  icon,
  danger,
  disabled,
  selected,
}: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors text-left',
        danger
          ? 'text-red-600 hover:bg-red-50'
          : 'text-gray-700 hover:bg-gray-50',
        disabled && 'opacity-50 cursor-not-allowed',
        selected && 'bg-primary-50 text-primary-700'
      )}
    >
      {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
      <span className="flex-1">{children}</span>
      {selected && <Check className="w-4 h-4 text-primary-500" />}
    </button>
  );
}

// ==========================================
// DROPDOWN DIVIDER
// ==========================================
export function DropdownDivider() {
  return <div className="my-1 border-t border-gray-100" />;
}

// ==========================================
// DROPDOWN COM SELECT
// ==========================================
interface DropdownSelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; cor?: string; icon?: ReactNode }[];
  placeholder?: string;
  className?: string;
  showColor?: boolean;
}

export function DropdownSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  className,
  showColor = true,
}: DropdownSelectProps<T>) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const opcaoSelecionada = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setAberto(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors text-left"
      >
        {showColor && opcaoSelecionada?.cor && (
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: opcaoSelecionada.cor }}
          />
        )}
        {opcaoSelecionada?.icon}
        <span className="flex-1 truncate">
          {opcaoSelecionada?.label || placeholder}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-gray-400 transition-transform',
            aberto && 'rotate-180'
          )}
        />
      </button>

      {aberto && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 max-h-60 overflow-auto animate-fade-in">
          {options.map((opcao) => (
            <button
              key={opcao.value}
              type="button"
              onClick={() => {
                onChange(opcao.value);
                setAberto(false);
              }}
              className={cn(
                'w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors text-left',
                value === opcao.value
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              {showColor && opcao.cor && (
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: opcao.cor }}
                />
              )}
              {opcao.icon}
              <span className="flex-1">{opcao.label}</span>
              {value === opcao.value && (
                <Check className="w-4 h-4 text-primary-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// CONTEXT MENU (Menu de contexto com posição do mouse)
// ==========================================
interface ContextMenuProps {
  x: number;
  y: number;
  children: ReactNode;
  onClose: () => void;
}

export function ContextMenu({ x, y, children, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Ajustar posição para não sair da tela
  const [position, setPosition] = useState({ x, y });

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const newX = x + rect.width > window.innerWidth ? x - rect.width : x;
      const newY = y + rect.height > window.innerHeight ? y - rect.height : y;
      setPosition({ x: Math.max(0, newX), y: Math.max(0, newY) });
    }
  }, [x, y]);

  return (
    <div
      ref={ref}
      className="fixed z-50 min-w-[160px] bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-fade-in"
      style={{ left: position.x, top: position.y }}
    >
      {children}
    </div>
  );
}

// ==========================================
// MULTI SELECT DROPDOWN
// ==========================================
interface MultiSelectDropdownProps<T extends string> {
  values: T[];
  onChange: (values: T[]) => void;
  options: { value: T; label: string; cor?: string }[];
  placeholder?: string;
  className?: string;
}

export function MultiSelectDropdown<T extends string>({
  values,
  onChange,
  options,
  placeholder = 'Selecione...',
  className,
}: MultiSelectDropdownProps<T>) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setAberto(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleValue = (value: T) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors text-left min-h-[42px]"
      >
        <div className="flex-1 flex flex-wrap gap-1">
          {values.length > 0 ? (
            values.map((v) => {
              const opt = options.find((o) => o.value === v);
              return (
                <span
                  key={v}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs"
                >
                  {opt?.cor && (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: opt.cor }}
                    />
                  )}
                  {opt?.label}
                </span>
              );
            })
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-gray-400 transition-transform flex-shrink-0',
            aberto && 'rotate-180'
          )}
        />
      </button>

      {aberto && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 max-h-60 overflow-auto animate-fade-in">
          {options.map((opcao) => (
            <button
              key={opcao.value}
              type="button"
              onClick={() => toggleValue(opcao.value)}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
            >
              <input
                type="checkbox"
                checked={values.includes(opcao.value)}
                onChange={() => {}}
                className="rounded border-gray-300 text-primary-500"
              />
              {opcao.cor && (
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: opcao.cor }}
                />
              )}
              <span className="flex-1">{opcao.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
