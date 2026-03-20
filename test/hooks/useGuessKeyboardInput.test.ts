import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WORD_LENGTH } from '../../src/constants';
import { useGuessKeyboardInput } from '../../src/components/room/keyboard/useGuessKeyboardInput';

describe('useGuessKeyboardInput', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('appendLetter normalizes input and backspace removes one letter', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();

    const { result } = renderHook(() =>
      useGuessKeyboardInput({
        value: 'AB',
        disabled: false,
        canSubmit: false,
        isSubmitting: false,
        onChange,
        onSubmit,
      }),
    );

    act(() => {
      result.current.appendLetter('c');
      result.current.backspace();
    });

    expect(onChange).toHaveBeenNthCalledWith(1, 'ABC');
    expect(onChange).toHaveBeenNthCalledWith(2, 'A');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submit sends the normalized current value when submission is allowed', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();

    const { result } = renderHook(() =>
      useGuessKeyboardInput({
        value: 'ab-c1',
        disabled: false,
        canSubmit: true,
        isSubmitting: false,
        onChange,
        onSubmit,
      }),
    );

    act(() => {
      result.current.submit();
    });

    expect(onSubmit).toHaveBeenCalledWith('ABC');
  });

  it('blocks imperative actions when disabled or submitting', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();

    const { result, rerender } = renderHook(
      (props: { disabled: boolean; isSubmitting: boolean }) =>
        useGuessKeyboardInput({
          value: 'AB',
          disabled: props.disabled,
          canSubmit: true,
          isSubmitting: props.isSubmitting,
          onChange,
          onSubmit,
        }),
      {
        initialProps: { disabled: true, isSubmitting: false },
      },
    );

    act(() => {
      result.current.appendLetter('C');
      result.current.backspace();
      result.current.submit();
    });

    rerender({ disabled: false, isSubmitting: true });

    act(() => {
      result.current.appendLetter('D');
      result.current.backspace();
      result.current.submit();
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.isBlocked).toBe(true);
  });

  it('handles letter, backspace, and enter keys from the window listener', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    const { rerender } = renderHook(
      (props: { value: string; canSubmit: boolean }) =>
        useGuessKeyboardInput({
          value: props.value,
          disabled: false,
          canSubmit: props.canSubmit,
          isSubmitting: false,
          onChange,
          onSubmit,
        }),
      {
        initialProps: { value: 'AB', canSubmit: false },
      },
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    });

    rerender({ value: 'ABCDE', canSubmit: true });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });

    expect(onChange).toHaveBeenNthCalledWith(1, 'ABC');
    expect(onChange).toHaveBeenNthCalledWith(2, 'A');
    expect(onSubmit).toHaveBeenCalledWith('ABCDE');
  });

  it('ignores keyboard input when focus is inside a text field', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    renderHook(() =>
      useGuessKeyboardInput({
        value: 'AB',
        disabled: false,
        canSubmit: true,
        isSubmitting: false,
        onChange,
        onSubmit,
      }),
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('ignores modified keys and letters beyond the max word length', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    const fullWord = 'A'.repeat(WORD_LENGTH);
    const { rerender } = renderHook(
      (props: { value: string }) =>
        useGuessKeyboardInput({
          value: props.value,
          disabled: false,
          canSubmit: false,
          isSubmitting: false,
          onChange,
          onSubmit,
        }),
      {
        initialProps: { value: 'AB' },
      },
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', ctrlKey: true }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', metaKey: true }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', altKey: true }));
    });

    rerender({ value: fullWord });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }));
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
