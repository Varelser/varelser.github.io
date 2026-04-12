import React from 'react';

type ResetKey = string | number | boolean | null | undefined;

export interface AppSceneErrorBoundaryProps extends React.PropsWithChildren {
  label: string;
  resetKeys?: readonly ResetKey[];
  compact?: boolean;
}

interface AppSceneErrorBoundaryState {
  error: Error | null;
}

function areResetKeysEqual(a: readonly ResetKey[] = [], b: readonly ResetKey[] = []) {
  if (a.length !== b.length) return false;
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) return false;
  }
  return true;
}

export class AppSceneErrorBoundary extends React.Component<AppSceneErrorBoundaryProps, AppSceneErrorBoundaryState> {
  state: AppSceneErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): AppSceneErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[${this.props.label}] scene render failure`, error, errorInfo);
  }

  componentDidUpdate(prevProps: Readonly<AppSceneErrorBoundaryProps>) {
    if (this.state.error && !areResetKeysEqual(prevProps.resetKeys, this.props.resetKeys)) {
      this.setState({ error: null });
    }
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    const { children, compact = false, label } = this.props;
    const { error } = this.state;
    if (!error) return children;

    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-4 text-white">
        <div className={`rounded-xl border border-white/15 bg-black/70 ${compact ? 'max-w-xs p-3' : 'max-w-md p-4'} shadow-2xl`}>
          <div className="text-[11px] uppercase tracking-[0.24em] text-white/45">Scene Guard</div>
          <div className={`mt-2 ${compact ? 'text-sm' : 'text-base'} font-medium text-white/90`}>{label} の描画で例外が発生しました。</div>
          <div className={`mt-2 ${compact ? 'text-[11px]' : 'text-xs'} leading-relaxed text-white/60`}>
            Canvas / scene のレンダリングを停止し、UI 本体は維持しています。設定を変えるか、再試行してください。
          </div>
          <div className={`mt-2 break-all rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono ${compact ? 'text-[10px]' : 'text-[11px]'} text-white/55`}>
            {error.message || 'Unknown scene error'}
          </div>
          <button
            type="button"
            onClick={this.handleRetry}
            className={`mt-3 rounded-md border border-white/15 bg-white/10 px-3 py-1.5 ${compact ? 'text-[11px]' : 'text-xs'} uppercase tracking-[0.18em] text-white/80 transition hover:bg-white/15`}
          >
            Retry Scene
          </button>
        </div>
      </div>
    );
  }
}
