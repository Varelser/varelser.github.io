// lib/useCanvasStream.ts
// Canvas MediaStream capture + MediaRecorder management hook.
// Provides start/stop recording and stream state for the Live Canvas Stream widget.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { WebGLRenderer } from 'three';

export type StreamBitrate = 4 | 8 | 16; // Mbps

export interface CanvasStreamState {
  isRecording: boolean;
  elapsed: number;        // seconds since recording started
  streamFps: number;
  bitrate: StreamBitrate;
  downloadUrl: string | null;
  downloadName: string | null;
  setStreamFps: (fps: number) => void;
  setBitrate: (b: StreamBitrate) => void;
  startRecording: () => void;
  stopRecording: () => void;
  clearDownload: () => void;
  canRecord: boolean;
}

export function useCanvasStream(
  rendererRef: React.RefObject<WebGLRenderer | null>,
): CanvasStreamState {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [streamFps, setStreamFps] = useState(60);
  const [bitrate, setBitrate] = useState<StreamBitrate>(8);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);
  const downloadUrlRef = useRef<string | null>(null);

  useEffect(() => {
    downloadUrlRef.current = downloadUrl;
  }, [downloadUrl]);

  const cleanupCaptureSession = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      try {
        recorder.stop();
      } catch {
        // Ignore shutdown races during unmount.
      }
    }
    recorderRef.current = null;
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      cleanupCaptureSession();
      if (downloadUrlRef.current) URL.revokeObjectURL(downloadUrlRef.current);
    };
  }, [cleanupCaptureSession]);

  const canRecord = typeof window !== 'undefined' &&
    typeof (HTMLCanvasElement.prototype as unknown as { captureStream?: unknown }).captureStream === 'function' &&
    typeof MediaRecorder !== 'undefined';

  const startRecording = useCallback(() => {
    const renderer = rendererRef.current;
    if (!renderer || isRecording) return;

    const canvas = renderer.domElement;
    const captureStream = (canvas as unknown as { captureStream?: (fps: number) => MediaStream }).captureStream;
    if (!captureStream) return;

    // Revoke previous download URL
    if (downloadUrl) { URL.revokeObjectURL(downloadUrl); setDownloadUrl(null); setDownloadName(null); }

    const stream = captureStream.call(canvas, streamFps);
    mediaStreamRef.current = stream;

    // Pick best supported MIME type
    const mimeTypes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4',
    ];
    const mimeType = mimeTypes.find(t => MediaRecorder.isTypeSupported(t)) ?? '';

    const recorder = new MediaRecorder(stream, {
      mimeType: mimeType || undefined,
      videoBitsPerSecond: bitrate * 1_000_000,
    });
    recorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType || 'video/webm' });
      const url = URL.createObjectURL(blob);
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      setDownloadUrl(url);
      setDownloadName(`kalokagathia-${ts}.${ext}`);
      setIsRecording(false);
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };

    recorder.start(200); // collect data every 200 ms
    elapsedRef.current = 0;
    setElapsed(0);
    setIsRecording(true);

    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
    }, 1000);
  }, [rendererRef, isRecording, streamFps, bitrate, downloadUrl]);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
  }, []);

  const clearDownload = useCallback(() => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setDownloadName(null);
  }, [downloadUrl]);

  return {
    isRecording,
    elapsed,
    streamFps,
    bitrate,
    downloadUrl,
    downloadName,
    setStreamFps,
    setBitrate,
    startRecording,
    stopRecording,
    clearDownload,
    canRecord,
  };
}

export function formatElapsed(sec: number): string {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
