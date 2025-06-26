/**
 * Gets a URL parameter value
 * @param name Parameter name
 * @returns Parameter value or empty string if not found
 */
export function getUrlParameter(name: string): string {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  const results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

/**
 * Downloads a file
 * @param siteUrl Site URL
 * @param itemId Item ID
 * @param fileName File name
 * @param libraryName Library name
 */
export function downloadFile(siteUrl: string, itemId: number, fileName: string, libraryName: string = 'OvertimeLib'): void {
  const filePath = `${siteUrl}/${libraryName}/${itemId}/${fileName}`;
  
  const link = document.createElement('a');
  link.href = filePath;
  link.download = fileName;
  link.click();
}
