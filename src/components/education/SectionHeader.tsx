interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
}

export function SectionHeader({ icon: Icon, title }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-4 mb-2">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h2 className="text-xl font-headline font-bold text-on-surface">{title}</h2>
    </div>
  );
}
