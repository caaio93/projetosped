import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Scrum Manager - Gerenciador de Projetos Ágeis',
  description: 'Sistema de gerenciamento de projetos utilizando metodologia Scrum',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
