import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRoomLinkShare } from '../../src/hooks/useRoomLinkShare';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('useRoomLinkShare', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('copies the current URL and shows copied state temporarily', async () => {
    vi.useFakeTimers();

    const writeText = vi.fn<() => Promise<void>>().mockResolvedValue();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const { result } = renderHook(() => useRoomLinkShare('room-1'));

    await act(async () => {
      await result.current.copyRoomLink();
    });

    expect(writeText).toHaveBeenCalledWith(window.location.href);
    expect(result.current.hasCopiedRoomLink).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.hasCopiedRoomLink).toBe(false);
  });

  it('falls back to prompt when clipboard write fails', async () => {
    const writeText = vi.fn<() => Promise<void>>().mockRejectedValue(new Error('no clipboard'));
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue(null);

    const { result } = renderHook(() => useRoomLinkShare('room-1'));

    await act(async () => {
      await result.current.copyRoomLink();
    });

    expect(promptSpy).toHaveBeenCalledWith('room.share.copyPromptTitle', window.location.href);
    expect(result.current.hasCopiedRoomLink).toBe(false);
  });

  it('uses the native share API when available', async () => {
    const share = vi.fn<() => Promise<void>>().mockResolvedValue();
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: share,
    });

    const { result } = renderHook(() => useRoomLinkShare('room-1'));

    await act(async () => {
      await result.current.shareRoomLink();
    });

    expect(share).toHaveBeenCalledWith({
      url: window.location.href,
      title: 'app.name',
      text: 'room.share.shareText',
    });
  });

  it('falls back to copying when native share is unavailable', async () => {
    const writeText = vi.fn<() => Promise<void>>().mockResolvedValue();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useRoomLinkShare('room-1'));

    await act(async () => {
      await result.current.shareRoomLink();
    });

    expect(writeText).toHaveBeenCalledWith(window.location.href);
  });

  it('does not fall back when native share is aborted by the user', async () => {
    const share = vi
      .fn<() => Promise<void>>()
      .mockRejectedValue(new DOMException('Aborted', 'AbortError'));
    const writeText = vi.fn<() => Promise<void>>().mockResolvedValue();
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: share,
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const { result } = renderHook(() => useRoomLinkShare('room-1'));

    await act(async () => {
      await result.current.shareRoomLink();
    });

    expect(share).toHaveBeenCalledTimes(1);
    expect(writeText).not.toHaveBeenCalled();
  });

  it('does nothing when roomId is missing', async () => {
    const writeText = vi.fn<() => Promise<void>>().mockResolvedValue();
    const share = vi.fn<() => Promise<void>>().mockResolvedValue();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: share,
    });

    const { result } = renderHook(() => useRoomLinkShare(undefined));

    await act(async () => {
      await result.current.copyRoomLink();
      await result.current.shareRoomLink();
    });

    expect(writeText).not.toHaveBeenCalled();
    expect(share).not.toHaveBeenCalled();
    expect(result.current.hasCopiedRoomLink).toBe(false);
  });
});
