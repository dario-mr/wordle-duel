import { useCallback, useEffect, useRef } from 'react';
import { WORD_LENGTH } from '../../../constants';
import { normalizeGuess } from '../../../utils/normalizeGuess';

export function useGuessKeyboardInput(params: {
  value: string;
  disabled: boolean;
  canSubmit: boolean;
  isSubmitting: boolean;
  onChange: (nextValue: string) => void;
  onSubmit: (word: string) => void;
}) {
  const isBlocked = params.disabled || params.isSubmitting;

  const valueRef = useRef(params.value);
  const isBlockedRef = useRef(isBlocked);
  const canSubmitRef = useRef(params.canSubmit);
  const onChangeRef = useRef(params.onChange);
  const onSubmitRef = useRef(params.onSubmit);

  useEffect(() => {
    valueRef.current = params.value;
    isBlockedRef.current = isBlocked;
    canSubmitRef.current = params.canSubmit;
    onChangeRef.current = params.onChange;
    onSubmitRef.current = params.onSubmit;
  }, [params.canSubmit, params.onChange, params.onSubmit, params.value, isBlocked]);

  const submit = useCallback(() => {
    if (isBlockedRef.current || !canSubmitRef.current) {
      return;
    }
    onSubmitRef.current(normalizeGuess(valueRef.current));
  }, []);

  const backspace = useCallback(() => {
    if (isBlockedRef.current) {
      return;
    }
    onChangeRef.current(normalizeGuess(valueRef.current.slice(0, -1)));
  }, []);

  const appendLetter = useCallback((letter: string) => {
    if (isBlockedRef.current) {
      return;
    }

    const currentValue = valueRef.current;
    if (currentValue.length >= WORD_LENGTH) {
      return;
    }

    onChangeRef.current(normalizeGuess(`${currentValue}${letter}`));
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isBlockedRef.current) {
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      const active = document.activeElement;
      if (
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          (active as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if (e.key === 'Enter') {
        if (!canSubmitRef.current) {
          return;
        }
        e.preventDefault();
        submit();
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        backspace();
        return;
      }

      if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        if (valueRef.current.length >= WORD_LENGTH) {
          return;
        }
        e.preventDefault();
        appendLetter(e.key.toUpperCase());
      }
    },
    [appendLetter, backspace, submit],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    isBlocked,
    submit,
    backspace,
    appendLetter,
  };
}
