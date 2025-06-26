import { sp } from "@pnp/sp";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import { downloadFile } from "../helpers/urlHelpers";

/**
 * File service class
 */
export class FileService {
  private siteUrl: string;
  private siteRelativeUrl: string;
  private libraryName: string;
  
  /**
   * Constructor
   * @param siteUrl Site URL
   * @param siteRelativeUrl Site relative URL
   * @param libraryName Library name
   */
  constructor(siteUrl: string, siteRelativeUrl: string, libraryName: string = 'OvertimeLib') {
    this.siteUrl = siteUrl;
    this.siteRelativeUrl = siteRelativeUrl;
    this.libraryName = libraryName;
  }
  
  /**
   * Uploads files
   * @param itemId Item ID
   * @param files Files to upload
   * @param originalFiles Original files
   * @returns Promise
   */
  public async uploadFiles(itemId: number, files: File[], originalFiles: any[]): Promise<void> {
    if (!itemId || !files) return;
    
    const folderPath = `${this.siteRelativeUrl}/${this.libraryName}/${itemId}`;
    
    // Upload new files
    await Promise.all(files.map(async (file) => {
      const fileExists = originalFiles.some(f => f.Name === file.name);
      
      if (!fileExists) {
        if (file.size <= 10485760) {
          // Small upload
          await sp.web.getFolderByServerRelativeUrl(folderPath).files.add(file.name, file, true);
        } else {
          // Large upload
          await sp.web.getFolderByServerRelativeUrl(folderPath).files.addChunked(file.name, file, data => {
            console.log({ data });
          }, true);
        }
      }
    }));
  }
  
  /**
   * Deletes files
   * @param itemId Item ID
   * @param filesToDelete Files to delete
   * @returns Promise
   */
  public async deleteFiles(itemId: number, filesToDelete: any[]): Promise<void> {
    if (!itemId || !filesToDelete || filesToDelete.length === 0) return;
    
    const folderPath = `${this.siteRelativeUrl}/${this.libraryName}/${itemId}`;
    
    await Promise.all(filesToDelete.map(async (file) => {
      const filePath = `${folderPath}/${file.Name}`;
      await sp.web.getFileByServerRelativeUrl(filePath).delete();
    }));
  }
  
  /**
   * Gets files from library
   * @param itemId Item ID
   * @returns Files
   */
  public async getFiles(itemId: number): Promise<any[]> {
    if (!itemId) return [];
    
    const folderPath = `${this.siteRelativeUrl}/${this.libraryName}/${itemId}`;
    
    try {
      const files = await sp.web.getFolderByServerRelativeUrl(folderPath)
        .files
        .select("*")
        .expand('ListItemAllFields')
        .get();
      
      return files;
    } catch (error) {
      console.error('Error getting files:', error);
      return [];
    }
  }
  
  /**
   * Handles file click
   * @param itemId Item ID
   * @param fileName File name
   */
  public handleFileClick(itemId: number, fileName: string): void {
    downloadFile(this.siteUrl, itemId, fileName, this.libraryName);
  }
  
  /**
   * Gets deleted files
   * @param originalFiles Original files
   * @param currentFiles Current files
   * @returns Deleted files
   */
  public getDeletedFiles(originalFiles: any[], currentFiles: File[]): any[] {
    if (!originalFiles || !currentFiles) return [];
    
    return originalFiles.filter(originalFile => {
      return !currentFiles.some(currentFile => currentFile.name === originalFile.Name);
    });
  }
}
