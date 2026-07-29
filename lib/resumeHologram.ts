// The RESUME button projects a hologram instead of downloading straight away.
// Several components trigger it (navbar, dossier), so it travels as a window
// event rather than threading state/context through the tree.
export const RESUME_HOLOGRAM_EVENT = "jarvis:open-resume";

export function openResumeHologram() {
  window.dispatchEvent(new Event(RESUME_HOLOGRAM_EVENT));
}
