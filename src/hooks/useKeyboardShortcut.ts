import { useEffect, useRef } from "react";

export interface ShortcutOptions {
  key: string;
  ctrlOrCmd?: boolean;
  shift?: boolean;
  alt?: boolean;
}

export function useKeyboardShortcut(
  options: ShortcutOptions,
  callback: (e: KeyboardEvent) => void,
  enabled: boolean = true
) {
  const { key, ctrlOrCmd, shift, alt } = options;
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input/textarea
      const target = event.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.getAttribute("role") === "textbox");

      if (isInput && !ctrlOrCmd) {
        return;
      }

      const matchesKey = event.key.toLowerCase() === key.toLowerCase();
      const matchesCmdOrCtrl = ctrlOrCmd
        ? event.ctrlKey || event.metaKey
        : !event.ctrlKey && !event.metaKey;
      const matchesShift = shift ? event.shiftKey : !event.shiftKey;
      const matchesAlt = alt ? event.altKey : !event.altKey;

      if (matchesKey && matchesCmdOrCtrl && matchesShift && matchesAlt) {
        event.preventDefault();
        callbackRef.current(event);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [key, ctrlOrCmd, shift, alt, enabled]);
}
