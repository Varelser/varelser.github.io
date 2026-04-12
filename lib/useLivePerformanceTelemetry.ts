import React from 'react';
import type { WebGLRenderer } from 'three';

export interface LivePerformanceTelemetry {
  fps: number;
  averageFrameTimeMs: number;
  worstFrameTimeMs: number;
  longFrameRatio: number;
  droppedFrameCount: number;
  rendererCalls: number;
  triangles: number;
  points: number;
  lines: number;
  geometries: number;
  textures: number;
  status: 'stable' | 'watch' | 'degraded';
}

const DEFAULT_TELEMETRY: LivePerformanceTelemetry = {
  fps: 0,
  averageFrameTimeMs: 0,
  worstFrameTimeMs: 0,
  longFrameRatio: 0,
  droppedFrameCount: 0,
  rendererCalls: 0,
  triangles: 0,
  points: 0,
  lines: 0,
  geometries: 0,
  textures: 0,
  status: 'stable',
};

function classifyStatus(fps: number, averageFrameTimeMs: number, longFrameRatio: number) {
  if (fps < 24 || averageFrameTimeMs > 35 || longFrameRatio > 0.35) return 'degraded';
  if (fps < 45 || averageFrameTimeMs > 24 || longFrameRatio > 0.15) return 'watch';
  return 'stable';
}

export function useLivePerformanceTelemetry(rendererRef: React.MutableRefObject<WebGLRenderer | null>, enabled: boolean) {
  const [telemetry, setTelemetry] = React.useState<LivePerformanceTelemetry>(DEFAULT_TELEMETRY);

  React.useEffect(() => {
    if (!enabled || typeof window === 'undefined' || typeof performance === 'undefined') {
      setTelemetry(DEFAULT_TELEMETRY);
      return;
    }

    let rafId = 0;
    let lastTimestamp = performance.now();
    let windowStart = lastTimestamp;
    let frameCount = 0;
    let totalFrameTime = 0;
    let longFrames = 0;
    let droppedFrameCount = 0;
    let worstFrameTimeMs = 0;

    const tick = (timestamp: number) => {
      const delta = Math.max(0, timestamp - lastTimestamp);
      lastTimestamp = timestamp;

      if (frameCount > 0) {
        totalFrameTime += delta;
        if (delta > 1000 / 45) longFrames += 1;
        if (delta > 1000 / 30) droppedFrameCount += 1;
        if (delta > worstFrameTimeMs) worstFrameTimeMs = delta;
      }
      frameCount += 1;

      const elapsed = timestamp - windowStart;
      if (elapsed >= 1000) {
        const renderer = rendererRef.current;
        const measuredFrames = Math.max(1, frameCount - 1);
        const fps = measuredFrames * 1000 / elapsed;
        const averageFrameTimeMs = totalFrameTime / measuredFrames;
        const longFrameRatio = longFrames / measuredFrames;
        const info = renderer?.info;

        setTelemetry({
          fps: Math.round(fps * 10) / 10,
          averageFrameTimeMs: Math.round(averageFrameTimeMs * 10) / 10,
          worstFrameTimeMs: Math.round(worstFrameTimeMs * 10) / 10,
          longFrameRatio: Math.round(longFrameRatio * 1000) / 1000,
          droppedFrameCount,
          rendererCalls: info?.render.calls ?? 0,
          triangles: info?.render.triangles ?? 0,
          points: info?.render.points ?? 0,
          lines: info?.render.lines ?? 0,
          geometries: info?.memory.geometries ?? 0,
          textures: info?.memory.textures ?? 0,
          status: classifyStatus(fps, averageFrameTimeMs, longFrameRatio),
        });

        windowStart = timestamp;
        frameCount = 0;
        totalFrameTime = 0;
        longFrames = 0;
        droppedFrameCount = 0;
        worstFrameTimeMs = 0;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [enabled, rendererRef]);

  return telemetry;
}
