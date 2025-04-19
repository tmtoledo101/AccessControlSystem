import { sp } from "@pnp/sp";
import "@pnp/sp/files";
import "@pnp/sp/folders";

export class FileService {
  private siteRelativeUrl: string;

  constructor(siteRelativeUrl: string) {
    this.siteRelativeUrl = siteRelativeUrl;
  }

  /**
   * Gets files from a folder
   * @param folderPath Folder path
   * @returns Array of files
   */
  public async getFiles(folderPath: string): Promise<any[]> {
    try {
      return await sp.web.getFolderByServerRelativeUrl(folderPath)
        .files
        .select("*")
        .top(5000)
        .expand('ListItemAllFields')
        .get();
    } catch (error) {
      console.error(`Error getting files from ${folderPath}:`, error);
      return [];
    }
  }

  /**
   * Uploads a file to a folder
   * @param folderPath Folder path
   * @param file File to upload
   * @returns Upload result
   */
  public async uploadFile(folderPath: string, file: File): Promise<any> {
    try {
      if (file.size <= 10485760) {
        // Small upload (less than 10MB)
        return await sp.web.getFolderByServerRelativeUrl(folderPath)
          .files.add(file.name, file, true);
      } else {
        // Large upload (chunked)
        return await sp.web.getFolderByServerRelativeUrl(folderPath)
          .files.addChunked(file.name, file, data => {
            console.log({ data });
          }, true);
      }
    } catch (error) {
      console.error(`Error uploading file ${file.name} to ${folderPath}:`, error);
      throw error;
    }
  }

  /**
   * Deletes a file
   * @param filePath File path
   */
  public async deleteFile(filePath: string): Promise<void> {
    try {
      await sp.web.getFileByServerRelativeUrl(filePath).delete();
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Creates a folder if it doesn't exist
   * @param folderPath Folder path
   */
  public async ensureFolderExists(folderPath: string): Promise<void> {
    try {
      await sp.web.getFolderByServerRelativeUrl(folderPath).get();
    } catch (error) {
      // Folder doesn't exist, create it
      await sp.web.folders.add(folderPath);
    }
  }

  /**
   * Gets visitor files
   * @param visitorId Visitor ID
   * @returns Object containing files, file names, and original files
   */
  public async getVisitorFiles(visitorId: number): Promise<{ files: any[], fileNames: string[], origFiles: any[] }> {
    const folderPath = `${this.siteRelativeUrl}/VisitorsLib/${visitorId}`;
    const files = await this.getFiles(folderPath);
    const fileNames = files.map(file => file.Name);
    
    return {
      files: [],
      fileNames,
      origFiles: files
    };
  }

  /**
   * Gets visitor details files
   * @param visitorDetailsId Visitor details ID
   * @returns Object containing files, file names, and original files
   */
  public async getVisitorDetailsFiles(visitorDetailsId: number): Promise<{ files: any[], fileNames: string[], origFiles: any[] }> {
    const folderPath = `${this.siteRelativeUrl}/VisitorDetailsLib/${visitorDetailsId}`;
    const files = await this.getFiles(folderPath);
    const fileNames = files.map(file => file.Name);
    
    return {
      files: [],
      fileNames,
      origFiles: files
    };
  }

  /**
   * Uploads visitor files
   * @param visitorId Visitor ID
   * @param files Files to upload
   * @param origFiles Original files
   * @param deleteFiles Files to delete
   */
  public async uploadVisitorFiles(
    visitorId: number,
    files: File[],
    origFiles: any[],
    deleteFiles: any[]
  ): Promise<void> {
    const folderPath = `${this.siteRelativeUrl}/VisitorsLib/${visitorId}`;
    
    // Upload new files
    await Promise.all(files.map(async file => {
      const filtered = origFiles.filter(f => f.Name === file.name);
      if (filtered.length === 0) {
        await this.uploadFile(folderPath, file);
      }
    }));
    
    // Delete files
    await Promise.all(deleteFiles.map(async file => {
      const filePath = `${folderPath}/${file.Name}`;
      await this.deleteFile(filePath);
    }));
  }

  /**
   * Uploads visitor details files
   * @param visitorDetailsId Visitor details ID
   * @param files Files to upload
   * @param origFiles Original files
   */
  public async uploadVisitorDetailsFiles(
    visitorDetailsId: number,
    files: File[],
    origFiles: any[]
  ): Promise<void> {
    const folderPath = `${this.siteRelativeUrl}/VisitorDetailsLib/${visitorDetailsId}`;
    
    // Upload new files
    await Promise.all(files.map(async file => {
      const filtered = origFiles.filter(f => f.Name === file.name);
      if (filtered.length === 0) {
        await this.uploadFile(folderPath, file);
      }
    }));
  }

  /**
   * Deletes visitor details files
   * @param deleteFiles Files to delete
   */
  public async deleteVisitorDetailsFiles(deleteFiles: { Id: number; Filename: string }[]): Promise<void> {
    await Promise.all(deleteFiles.map(async file => {
      const filePath = `${this.siteRelativeUrl}/VisitorDetailsLib/${file.Id}/${file.Filename}`;
      await this.deleteFile(filePath);
    }));
  }

  /**
   * Gets the URL for a file
   * @param folderPath Folder path
   * @param fileName File name
   * @returns File URL
   */
  public getFileUrl(folderPath: string, fileName: string): string {
    return `${folderPath}/${fileName}`;
  }
}
