/**
 * Resume links use target="_blank" so the PDF opens in a new tab to read —
 * that's the accessible, no-JS-required default. This handler additionally
 * fires a forced download of a copy, so one click satisfies both "let me
 * read it" and "let me keep it."
 */
export function triggerResumeDownload(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = "Naram_Charan_Resume.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
