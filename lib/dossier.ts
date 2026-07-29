// The RESUME button projects the personnel-file hologram. Several components
// trigger it (navbar desktop + mobile menu), so it travels as a window event
// rather than threading state or context through the tree.
export const DOSSIER_EVENT = "jarvis:open-dossier";

export function openDossier() {
  window.dispatchEvent(new Event(DOSSIER_EVENT));
}
