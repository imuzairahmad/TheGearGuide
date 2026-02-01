type ScoreBarProps = {
  label: string;
  score: number; // 0–10
};

export default function ScoreBar({ label, score }: ScoreBarProps) {
  const percent = Math.min((score / 10) * 100, 100);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm font-medium">
        <span className="uppercase tracking-wide">{label}</span>
        <span>{score.toFixed(1)}</span>
      </div>

      <div className="h-2 rounded-full bg-gray-300 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
