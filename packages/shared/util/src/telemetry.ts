export type TelemetryContext = Record<string, unknown>;

/** Where reports go. A real app installs a sink that ships them somewhere. */
export interface TelemetrySink {
  error(error: unknown, context?: TelemetryContext): void;
}

const consoleSink: TelemetrySink = {
  error: (error, context) => console.error('[telemetry]', error, context),
};

let sink: TelemetrySink = consoleSink;

/**
 * Installs a sink and returns a function that puts the previous one back.
 * Called once by the app at start-up; tests use the returned function.
 */
export function setTelemetrySink(next: TelemetrySink): () => void {
  const previous = sink;
  sink = next;
  return () => {
    sink = previous;
  };
}

/**
 * Reports something that went wrong without interrupting the user. Never
 * throws: it runs when something has already failed, and must not be what
 * takes the page down.
 */
export function reportError(error: unknown, context?: TelemetryContext): void {
  try {
    sink.error(error, context);
  } catch {
    // A failing sink has nowhere left to report to.
  }
}
