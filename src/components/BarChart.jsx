export default function BarChart({
  title,
  data = [],
  labels = [],
  unit = "",
}) {
  const maxValue = Math.max(...data, 1);

  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
      <p className="text-sm font-medium text-slate-300 mb-4">
        {title}
      </p>

     
      <div className="h-56 flex items-end gap-5">
        {data.map((value, i) => {
          const barHeight = (value / maxValue) * 100;

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end"
            >
              <span className="text-xs text-slate-400 mb-2">
                {value}{unit}
              </span>
              <div className="h-40 w-4 sm:w-5 flex items-end">
                <div
                  className="w-full bg-emerald-500/80 rounded-full transition-all"
                  style={{ height: `${barHeight}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 mt-3">
                {labels[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

