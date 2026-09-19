import { setTelemetrySink, type TelemetrySink } from '@momo/shared-util';

import { createQueryClient } from './query-client';

// spec home-page: a failed query is reported once, wherever it was made.
describe('createQueryClient', () => {
  let sink: TelemetrySink;
  let restore: () => void;

  beforeEach(() => {
    sink = { error: vi.fn() };
    restore = setTelemetrySink(sink);
  });

  afterEach(() => {
    restore();
  });

  it('reports a failed query once, with the key that failed', async () => {
    const client = createQueryClient();
    const failure = new Error('cms is down');

    await expect(
      client.fetchQuery({
        queryKey: ['home', 'layout'],
        queryFn: () => Promise.reject(failure),
      }),
    ).rejects.toBe(failure);

    expect(sink.error).toHaveBeenCalledTimes(1);
    expect(sink.error).toHaveBeenCalledWith(failure, {
      queryKey: ['home', 'layout'],
    });
  });

  it('reports nothing for a query that succeeds', async () => {
    const client = createQueryClient();

    const data = await client.fetchQuery({
      queryKey: ['home', 'layout'],
      queryFn: () => Promise.resolve(['ok']),
    });

    expect(data).toEqual(['ok']);
    expect(sink.error).not.toHaveBeenCalled();
  });
});
