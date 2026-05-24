"use client";

import { useMemo } from "react";

interface HeatmapProps {
  data: number[];
  labels: string[];
  title: string;
  type: "hourly" | "daily";
}

export default function ActivityHeatmap({ data, labels, title, type }: HeatmapProps) {
  const max = Math.max(...data, 1);

  const getColor = (value: number) => {
    const intensity = value / max;
    if (intensity === 0) return "bg-gray-100";
    if (intensity < 0.2) return "bg-indigo-100";
    if (intensity < 0.4) return "bg-indigo-200";
    if (intensity < 0.6) return "bg-indigo-300";
    if (intensity < 0.8) return "bg-indigo-400";
    return "bg-indigo-500";
  };

  const displayData = useMemo(() => {
    if (type === "hourly") {
      return data.map((v, i) => ({
        label: `${i.toString().padStart(2, "0")}:00`,
        value: v,
      }));
    }
    return data.map((v, i) => ({
      label: labels[i] || `Day ${i}`,
      value: v,
    }));
  }, [data, labels, type]);

  return (
    <div className="glass-card p-4 animate-fade-in animate-fade-in-delay-1">
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">{title}</h3>
      <div className={`grid ${type === "hourly" ? "grid-cols-12" : "grid-cols-7"} gap-1.5`}>
        {displayData.map((item, i) => (
          <div key={i} className="group relative">
            <div
              className={`${getColor(item.value)} rounded-lg aspect-square transition-all hover:ring-2 hover:ring-indigo-400 hover:scale-110 cursor-pointer`}
              title={`${item.label}: ${item.value} txs`}
            />
            {(type === "daily" || i % 4 === 0) && (
              <div className="text-[9px] text-gray-400 dark:text-gray-500 text-center mt-1 truncate font-medium">
                {type === "daily" ? item.label.slice(0, 3) : item.label}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1.5 mt-3">
        <span className="text-[10px] text-gray-400 dark:text-gray-500">Less</span>
        {["bg-gray-100", "bg-indigo-100", "bg-indigo-200", "bg-indigo-300", "bg-indigo-500"].map((c, i) => (
          <div key={i} className={`${c} w-3 h-3 rounded`} />
        ))}
        <span className="text-[10px] text-gray-400 dark:text-gray-500">More</span>
      </div>
    </div>
  );
}
