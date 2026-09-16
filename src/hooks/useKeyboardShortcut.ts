import { useEffect } from "react";

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
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input/textarea
      const target = event.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (isInput && !options.ctrlOrCmd) {
        return;
      }

      const matchesKey = event.key.toLowerCase() === options.key.toLowerCase();
      const matchesCmdOrCtrl = options.ctrlOrCmd
        ? event.ctrlKey || event.metaKey
        : true;
      const matchesShift = options.shift ? event.shiftKey : !event.shiftKey;
      const matchesAlt = options.alt ? event.altKey : !event.altKey;

      if (matchesKey && matchesCmdOrCtrl && matchesShift && matchesAlt) {
        event.preventDefault();
        callback(event);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [options, callback, enabled]);
}
