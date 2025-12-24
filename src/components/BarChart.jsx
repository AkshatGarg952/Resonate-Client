// export default function BarChart({ title, data = [] }) {
//   const max = Math.max(...data, 1);

//   return (
//     <div>
//       <p className="text-sm text-slate-300 mb-2">{title}</p>
//       <div className="flex items-end gap-2 h-24">
//         {data.map((v, i) => (
//           <div
//             key={i}
//             className="flex-1 bg-emerald-500/80 rounded-md"
//             style={{ height: `${(v / max) * 100}%` }}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

export default function BarChart({
  title,
  data = [],
  labels = [],
  unit = "",
}) {
  const max = Math.max(...data, 1);

  return (
    <div className="space-y-4">
      {/* Title */}
      <p className="text-sm font-medium text-slate-300">
        {title}
      </p>

      {/* Chart */}
      <div className="relative h-56">
        {/* Baseline */}
        <div className="absolute bottom-8 left-0 right-0 h-px bg-slate-700/60" />

        {/* Bars */}
        <div className="absolute inset-0 flex items-end gap-5 pb-8">
          {data.map((value, i) => {
            const height = Math.max((value / max) * 100, 6);

            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center"
              >
                {/* Value */}
                <span className="text-xs text-slate-400 mb-2">
                  {value}{unit}
                </span>

                {/* Bar */}
                <div
                  className="w-4 sm:w-5 rounded-full bg-emerald-500/80"
                  style={{ height: `${height}%` }}
                />

                {/* Label */}
                <span className="text-xs text-slate-500 mt-3">
                  {labels[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
