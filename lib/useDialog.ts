"use client";

import { useEffect, type RefObject } from "react";

/** Both portfolio dialogs share keyboard containment, background isolation and focus restoration. */
export function useDialog(open: boolean, panelRef: RefObject<HTMLDivElement | null>, onClose: () => void) {
  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    const isolated: { element: HTMLElement; inert: boolean }[] = [];
    // Isolate siblings along the entire ancestor chain, including the scrim.
    let branch: HTMLElement = panel;
    while (branch.parentElement && branch !== document.body) {
      for (const sibling of branch.parentElement.children) {
        if (sibling !== branch && sibling instanceof HTMLElement && !sibling.hasAttribute("data-dialog-scrim")) {
          isolated.push({ element: sibling, inert: sibling.inert });
          sibling.setAttribute("inert", "");
        }
      }
      branch = branch.parentElement;
    }
    document.body.style.overflow = "hidden";
    const controls = () => [...panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])')]
      .filter(element => element.getClientRects().length > 0 && !element.closest('[inert]'));
    const focusFirst = () => (controls()[0] ?? panel).focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab") return;
      const items = controls();
      const first = items[0];
      const last = items.at(-1);
      const current = document.activeElement;
      if (!first || !last) { event.preventDefault(); panel.focus(); return; }
      if (event.shiftKey && (current === first || current === panel || !panel.contains(current))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (current === last || current === panel || !panel.contains(current))) {
        event.preventDefault(); first.focus();
      }
    };
    const onFocus = (event: FocusEvent) => {
      if (event.target instanceof Node && !panel.contains(event.target)) focusFirst();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocus);
    focusFirst();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocus);
      isolated.forEach(({ element, inert }) => { if (inert) element.setAttribute("inert", ""); else element.removeAttribute("inert"); });
      document.body.style.overflow = overflow;
      if (trigger?.isConnected) trigger.focus();
    };
  }, [open, panelRef, onClose]);
}
