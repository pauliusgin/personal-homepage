"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface NewsFilterFloatProps {
  /**
   * Rendered inside the dismissal boundary on purpose: a click on the trigger
   * must not read as "outside", or opening the float would close it again.
   */
  trigger: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}

/**
 * Not `<details>`: a native disclosure pushes the feed down instead of floating
 * over it, has no Escape, and cannot be closed by clicking elsewhere.
 *
 * Positioning is CSS — the wrapper is the anchor and the panel is absolute
 * against it, so the float stays glued through a wrap or resize.
 */
export function NewsFilterFloat({
  trigger,
  isOpen,
  onClose,
  label,
  children,
}: NewsFilterFloatProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  // Captured on open rather than assumed to be the trigger: with several
  // triggers under one anchor, "the trigger" is whichever chip was clicked.
  const focusReturnTargetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    focusReturnTargetRef.current = document.activeElement as HTMLElement | null;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Bound to the window: a panel-scoped handler only fires while focus sits
    // inside the panel, leaving it unclosable by keyboard from anywhere else.
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }
      event.preventDefault();
      onClose();
      focusReturnTargetRef.current?.focus();
    }

    // `pointerdown` and not `click`: a press starting outside and releasing
    // inside never produces a `click` on the outside element.
    function handlePointerDownOutside(event: PointerEvent) {
      const anchor = anchorRef.current;
      if (!anchor || anchor.contains(event.target as Node)) {
        return;
      }
      onClose();
    }

    window.addEventListener("keydown", handleEscapeKey);
    document.addEventListener("pointerdown", handlePointerDownOutside);
    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
      document.removeEventListener("pointerdown", handlePointerDownOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div className="news-filter-anchor" ref={anchorRef}>
      {trigger}

      {isOpen ? (
        // Following the trigger in DOM order means Tab reaches the panel
        // without focus being stolen on open.
        <div className="news-filter-float" role="dialog" aria-label={label}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
