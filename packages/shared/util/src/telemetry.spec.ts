import {
  reportError,
  setTelemetrySink,
  type TelemetrySink,
} from './telemetry.js';

describe('reportError', () => {
  it('hands the error and its context to the installed sink', () => {
    const sink: TelemetrySink = { error: vi.fn() };
    const restore = setTelemetrySink(sink);

    const error = new Error('boom');
    reportError(error, { sectionType: 'video-wall' });

    expect(sink.error).toHaveBeenCalledTimes(1);
    expect(sink.error).toHaveBeenCalledWith(error, {
      sectionType: 'video-wall',
    });
    restore();
  });

  it('goes back to the previous sink when the returned function is called', () => {
    const first: TelemetrySink = { error: vi.fn() };
    const second: TelemetrySink = { error: vi.fn() };
    const restoreFirst = setTelemetrySink(first);
    const restoreSecond = setTelemetrySink(second);

    restoreSecond();
    reportError(new Error('after restore'));

    expect(second.error).not.toHaveBeenCalled();
    expect(first.error).toHaveBeenCalledTimes(1);
    restoreFirst();
  });

  // Reporting is what runs when something has already gone wrong. It must
  // not be the thing that takes the page down.
  it('never throws, even when the sink does', () => {
    const failing = vi.fn(() => {
      throw new Error('the sink is down');
    });
    const restore = setTelemetrySink({ error: failing });

    expect(() => reportError(new Error('boom'))).not.toThrow();
    // Without this, a reportError that does nothing at all would pass.
    expect(failing).toHaveBeenCalledTimes(1);
    restore();
  });

  it('writes to the console when no sink was installed', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const error = new Error('boom');
    reportError(error, { where: 'test' });

    expect(spy).toHaveBeenCalledWith('[telemetry]', error, { where: 'test' });
    spy.mockRestore();
  });
});
