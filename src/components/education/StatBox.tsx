interface StatBoxProps {
  label: string;
  value: string;
  sub?: string;
}

export function StatBox({ label, value, sub }: StatBoxProps) {
  return (
    <div className="bg-surface-container-low border border-outline-variant/30 p-3 rounded-xl text-center">
      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
        {label}
      </p>
      <p className="text-xl font-black text-on-surface">{value}</p>
      {sub && <p className="text-[10px] text-on-surface-variant mt-1">{sub}</p>}
    </div>
  );
}
