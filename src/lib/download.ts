export function triggerFileDownload(url: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.click();
}
