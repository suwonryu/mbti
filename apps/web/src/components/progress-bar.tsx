type ProgressBarProps = {
  current: number;
  total: number;
};

export function ProgressBar({ current, total }: ProgressBarProps) {
  const safeTotal = total === 0 ? 1 : total;
  const percent = Math.round((current / safeTotal) * 100);

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-sm text-slate-600">
        <span>진행률</span>
        <span>{percent}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-orange-100">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
