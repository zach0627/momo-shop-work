export type TelemetryContext = Record<string, unknown>;

/** 回報的去處；app 可以換成真的監控服務。 */
export interface TelemetrySink {
  error(error: unknown, context?: TelemetryContext): void;
}

const consoleSink: TelemetrySink = {
  error: (error, context) => console.error('[telemetry]', error, context),
};

let sink: TelemetrySink = consoleSink;

/** 換上新的 sink，回傳「還原成上一個」的函式（測試用）。 */
export function setTelemetrySink(next: TelemetrySink): () => void {
  const previous = sink;
  sink = next;
  return () => {
    sink = previous;
  };
}

/** 回報錯誤但不打斷使用者。絕不 throw：它是在已經出錯時執行的。 */
export function reportError(error: unknown, context?: TelemetryContext): void {
  try {
    sink.error(error, context);
  } catch {
    // sink 自己壞了，也沒有別的地方可以回報
  }
}
