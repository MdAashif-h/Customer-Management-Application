export function CustomerGrowthChart({
  growth = [],
  months = [],
}: {
  growth?: number[];
  months?: number[] | string[];
}) {
  const monthLabels = months.map(String);
  const data = growth.length ? growth : [0, 0, 0, 0, 0, 0];
  const labels = monthLabels.length ? monthLabels : ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max > min ? max - min : 1;

  const points = data
    .map((val, idx) => {
      const x = (idx * (100 / Math.max(data.length - 1, 1))).toFixed(1);
      const normalized = (val - min) / range;
      // y goes from 100 (bottom) to 25 (top)
      const y = max === 0 ? 100 : (100 - normalized * 75).toFixed(1);
      return `${x},${y}`;
    })
    .join(" ");

  const latestVal = data[data.length - 1] ?? 0;
  const firstVal = data[0] ?? 0;

  return (
    <div className="dash-card chart-card">
      <div className="dash-card-header">
        <div>
          <h2>Customer growth</h2>
          <p>Total customers over time</p>
        </div>
        <span>Last 6 months</span>
      </div>
      <svg
        viewBox="0 0 108 120"
        className="growth-chart"
        role="img"
        aria-label={`Customer growth trend from ${firstVal} to ${latestVal}`}
      >
        <defs>
          <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#55c49d" stopOpacity=".24" />
            <stop offset="1" stopColor="#55c49d" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[20, 50, 80, 105].map((line) => (
          <line
            key={line}
            x1="0"
            x2="108"
            y1={line}
            y2={line}
            stroke="rgba(213,235,226,.1)"
            strokeWidth=".5"
          />
        ))}
        {data.length > 1 && (
          <>
            <polygon
              points={`0,110 ${points} 100,110`}
              fill="url(#chart-fill)"
            />
            <polyline
              points={points}
              fill="none"
              stroke="#55c49d"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
        {data.map((val, idx) => {
          const cx = idx * (100 / Math.max(data.length - 1, 1));
          const normalized = (val - min) / range;
          const cy = max === 0 ? 100 : 100 - normalized * 75;
          return (
            <circle
              key={idx}
              cx={cx}
              cy={cy}
              r="2"
              fill="#0f1714"
              stroke="#55c49d"
              strokeWidth="1.2"
            />
          );
        })}
      </svg>
      <div className="chart-labels">
        {labels.map((month, idx) => (
          <span key={`${month}-${idx}`}>{month}</span>
        ))}
      </div>
    </div>
  );
}