"use client";

import { useMemo } from "react";

interface HeatmapProps {
  data: number[]; // 24 hours or 7 days
  labels: string[];
  title: string;
  type: "hourly" | "daily";
}

export default function ActivityHeatmap({ data, labels, title, type }: HeatmapProps) {
  const max = Math.max(...data, 1);

  const getColor = (value: number) => {
    const intensity = value / max;
    if (intensity === 0) return "bg-gray-800";
    if (intensity < 0.2) return "bg-purple-900/60";
    if (intensity < 0.4) return "bg-purple-800/70";
    if (intensity < 0.6) return "bg-purple-700/80";
    if (intensity < 0.8) return "bg-purple-600/90";
    return "bg-purple-500";
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
    <div className="bg-gray-900/50 rounded-xl border border-gray-700/30 p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">{title}</h3>
      <div className={`grid ${type === "hourly" ? "grid-cols-12" : "grid-cols-7"} gap-1`}>
        {displayData.map((item, i) => (
          <div key={i} className="group relative">
            <div
              className={`${getColor(item.value)} rounded aspect-square transition-all hover:ring-1 hover:ring-purple-400 cursor-pointer`}
              title={`${item.label}: ${item.value} txs`}
            />
            {(type === "daily" || i % 4 === 0) && (
              <div className="text-[9px] text-gray-600 text-center mt-0.5 truncate">
                {type === "daily" ? item.label.slice(0, 3) : item.label}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1 mt-2">
        <span className="text-[10px] text-gray-600">Less</span>
        {["bg-gray-800", "bg-purple-900/60", "bg-purple-800/70", "bg-purple-700/80", "bg-purple-500"].map((c, i) => (
          <div key={i} className={`${c} w-3 h-3 rounded`} />
        ))}
        <span className="text-[10px] text-gray-600">More</span>
      </div>
    </div>
  );
}
