import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import type { HomeSection } from '../models/home-section';
import type { HomeRepository } from '../repository/home-repository';
import { createFakeHomeRepository, HomeTestProvider } from '../testing';
import { useHomeLayout } from './use-home-layout';

const wrapperWith =
  (repository: HomeRepository) =>
  ({ children }: { children: ReactNode }) => (
    <HomeTestProvider repository={repository}>{children}</HomeTestProvider>
  );

const layout: HomeSection[] = [
  { id: 'flash-sale', type: 'flash-sale', title: { text: '限時搶購' } },
];

describe('useHomeLayout', () => {
  it('is pending first, then has the layout of the injected repository', async () => {
    const repository = createFakeHomeRepository({
      getLayout: async () => layout,
    });

    const { result } = renderHook(() => useHomeLayout(), {
      wrapper: wrapperWith(repository),
    });

    expect(result.current.isPending).toBe(true);
    await waitFor(() => expect(result.current.data).toEqual(layout));
  });

  it('surfaces a failing repository as an error, not as an empty page', async () => {
    const repository = createFakeHomeRepository({
      getLayout: async () => {
        throw new Error('cms is down');
      },
    });

    const { result } = renderHook(() => useHomeLayout(), {
      wrapper: wrapperWith(repository),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });

  it('refuses to run without a provider, and says what is missing', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => renderHook(() => useHomeLayout())).toThrow(
      /HomeRepositoryProvider/,
    );
    spy.mockRestore();
  });
});
