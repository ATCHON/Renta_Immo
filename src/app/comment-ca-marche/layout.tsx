import { CommentCaMarcheNav } from './CommentCaMarcheNav';

export default function CommentCaMarcheLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <CommentCaMarcheNav />
      {/* Offset du contenu pour la sidebar desktop */}
      <div className="flex-1 md:ml-64">{children}</div>
    </div>
  );
}
