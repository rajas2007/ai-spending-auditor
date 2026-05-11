"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";

interface StableChartFrameProps {
  children: ReactElement;
  className?: string;
}

interface ChartSize {
  width: number;
  height: number;
}

export function StableChartFrame({ children, className }: StableChartFrameProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<ChartSize>({ width: 0, height: 0 });

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;

    const updateSize = () => {
      const rect = node.getBoundingClientRect();
      const next = {
        width: Math.floor(rect.width),
        height: Math.floor(rect.height),
      };

      setSize((current) =>
        current.width === next.width && current.height === next.height ? current : next,
      );
    };

    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    const frame = window.requestAnimationFrame(updateSize);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  const canRenderChart = size.width > 0 && size.height > 0;

  return (
    <div
      ref={frameRef}
      className={cn(
        "relative h-56 min-h-[14rem] w-full min-w-0 overflow-hidden",
        className,
      )}
    >
      {canRenderChart ? (
        <ResponsiveContainer width={size.width} height={size.height}>
          {children}
        </ResponsiveContainer>
      ) : (
        <ChartSkeleton />
      )}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="flex h-full min-h-[inherit] w-full items-center justify-center rounded-lg border border-border/60 bg-background/30 text-xs text-muted-foreground">
      Preparing chart
    </div>
  );
}
