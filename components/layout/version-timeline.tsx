"use client";

import { cn } from "@/lib/utils";
import { type Version } from "@/lib/versions";

interface VersionTimelineProps {
  versions: Version[];
}

export function VersionTimeline({ versions }: VersionTimelineProps) {
  return (
    <div className="relative">
      {/* Vertical connecting line */}
      <div className="absolute left-[7px] top-3 bottom-3 w-px bg-gradient-to-b from-indigo-300 via-indigo-100 to-transparent" />

      <div className="flex flex-col gap-10">
        {versions.map((v, i) => {
          const isCurrent = i === 0;
          return (
            <div key={v.version} className="flex gap-6 relative">
              {/* Dot */}
              <div className="relative shrink-0 mt-1">
                {isCurrent && (
                  <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-40" />
                )}
                <div
                  className={cn(
                    "w-[15px] h-[15px] rounded-full border-2 border-white z-10 relative",
                    isCurrent ? "bg-indigo-600 shadow-md shadow-indigo-200" : "bg-gray-300",
                  )}
                />
              </div>

              {/* Content */}
              <div className="pb-1">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span
                    className={cn(
                      "text-xs font-bold px-2.5 py-0.5 rounded-full tracking-wide",
                      isCurrent
                        ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
                        : "bg-gray-100 text-gray-500",
                    )}
                  >
                    v{v.version}
                  </span>
                  {isCurrent && (
                    <span className="text-xs font-semibold text-indigo-500 uppercase tracking-widest">
                      Current
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    "font-semibold text-base leading-snug",
                    isCurrent ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {v.title}
                </p>
                {v.description && (
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {v.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
