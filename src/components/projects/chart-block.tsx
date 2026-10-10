type DataPoint = { label: string; value: number; unit?: string };

function formatValue(point: DataPoint) {
  return `${point.value}${point.unit ?? ""}`;
}

// A handful of different-unit headline numbers (a %, a currency figure, a
// count) have no shared scale to plot on — showing them as bars would
// misrepresent a 40Cr figure as dwarfing a 4.4% one. Stat cards show each
// on its own terms instead.
function StatCards({ title, dataPoints }: { title: string; dataPoints: DataPoint[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {dataPoints.map((point) => (
          <div key={point.label} className="rounded-md bg-muted/50 p-3 text-center">
            <p className="font-mono text-lg font-semibold text-primary">{formatValue(point)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{point.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// A small, honest chart for 2-5 same-unit data points pulled straight from
// a cited claim — single series, so per the dataviz skill's rules: no
// legend (the title already names what's plotted), text stays in text
// tokens and only the bar itself carries the accent color.
function Bars({ title, dataPoints }: { title: string; dataPoints: DataPoint[] }) {
  const max = Math.max(...dataPoints.map((p) => Math.abs(p.value)), 1);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <div className="mt-3 space-y-2.5">
        {dataPoints.map((point) => (
          <div key={point.label} className="flex items-center gap-3">
            <span className="w-20 shrink-0 truncate text-xs text-muted-foreground">{point.label}</span>
            <div className="flex-1 border-l border-border pl-0">
              <div
                className="h-5 rounded-r-[4px] bg-primary"
                style={{ width: `${Math.max((Math.abs(point.value) / max) * 100, 4)}%` }}
              />
            </div>
            <span className="w-14 shrink-0 text-right text-xs font-medium text-foreground">
              {formatValue(point)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartBlock({
  title,
  display,
  dataPoints,
}: {
  title: string;
  display: "bars" | "stats";
  dataPoints: DataPoint[];
}) {
  return display === "stats" ? (
    <StatCards title={title} dataPoints={dataPoints} />
  ) : (
    <Bars title={title} dataPoints={dataPoints} />
  );
}
