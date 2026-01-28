'use client';

import { useRef, useEffect, useCallback } from 'react';
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  Code, 
  Quote,
  Strikethrough,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  showHelp?: boolean;
}

export function MarkdownEditor({ 
  value, 
  onChange, 
  placeholder = 'Digite o conteúdo...', 
  rows = 10,
  className,
  showHelp = true
}: MarkdownEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Sincronizar valor externo com o editor
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const formatActions = [
    { icon: Bold, title: 'Negrito (Ctrl+B)', action: () => execCommand('bold') },
    { icon: Italic, title: 'Itálico (Ctrl+I)', action: () => execCommand('italic') },
    { icon: Strikethrough, title: 'Tachado', action: () => execCommand('strikeThrough') },
    { type: 'divider' },
    { icon: Heading1, title: 'Título 1', action: () => execCommand('formatBlock', 'h1') },
    { icon: Heading2, title: 'Título 2', action: () => execCommand('formatBlock', 'h2') },
    { type: 'divider' },
    { icon: List, title: 'Lista', action: () => execCommand('insertUnorderedList') },
    { icon: ListOrdered, title: 'Lista numerada', action: () => execCommand('insertOrderedList') },
    { type: 'divider' },
    { 
      icon: Link, 
      title: 'Link', 
      action: () => {
        const url = prompt('Digite a URL do link:');
        if (url) execCommand('createLink', url);
      }
    },
    { 
      icon: Image, 
      title: 'Imagem', 
      action: () => {
        const url = prompt('Digite a URL da imagem:');
        if (url) execCommand('insertImage', url);
      }
    },
    { type: 'divider' },
    { 
      icon: Code, 
      title: 'Código', 
      action: () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const code = document.createElement('code');
          code.className = 'bg-gray-100 px-1 rounded text-sm font-mono';
          range.surroundContents(code);
          handleInput();
        }
      }
    },
    { 
      icon: Quote, 
      title: 'Citação', 
      action: () => execCommand('formatBlock', 'blockquote')
    },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault();
        execCommand('bold');
      } else if (e.key === 'i') {
        e.preventDefault();
        execCommand('italic');
      }
    }
  };

  const minHeight = rows * 24; // Aproximadamente 24px por linha

  return (
    <div className={cn("border border-primary-400 rounded-lg overflow-hidden", className)}>
      {/* Barra de formatação */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 border-b">
        {formatActions.map((action, index) => 
          action.type === 'divider' ? (
            <div key={index} className="w-px h-5 bg-gray-300 mx-1" />
          ) : (
            <button
              key={index}
              type="button"
              onClick={action.action}
              title={action.title}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
            >
              {action.icon && <action.icon className="w-4 h-4" />}
            </button>
          )
        )}
      </div>

      {/* Editor WYSIWYG */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        className={cn(
          "w-full px-3 py-2 focus:outline-none overflow-auto",
          "prose prose-sm max-w-none",
          "[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-400",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600",
          "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-2",
          "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-2",
          "[&_ul]:list-disc [&_ul]:pl-5",
          "[&_ol]:list-decimal [&_ol]:pl-5",
          "[&_a]:text-primary-500 [&_a]:underline",
          "[&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono"
        )}
        style={{ minHeight: `${minHeight}px` }}
      />

      {/* Footer */}
      {showHelp && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-t text-xs">
          <span className="text-gray-500">Editor de texto</span>
        </div>
      )}
    </div>
  );
}
