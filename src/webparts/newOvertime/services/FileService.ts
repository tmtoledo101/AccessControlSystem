import { sp } from '@pnp/sp';
import '@pnp/sp/files';
import '@pnp/sp/folders';

/**
 * File service
 */
export class FileService {
  /**
   * Upload files
   * @param folderPath Folder path
   * @param files Files
   */
  public static async uploadFiles(folderPath: string, files: File[]): Promise<void> {
    await Promise.all(files.map(async (file) => {
      await this.uploadFile(folderPath, file);
    }));
  }

  /**
   * Upload file
   * @param folderPath Folder path
   * @param file File
   */
  public static async uploadFile(folderPath: string, file: File): Promise<void> {
    if (file.size <= 10485760) {
      // Small upload
      await sp.web.getFolderByServerRelativeUrl(folderPath).files.add(file.name, file, true);
    } else {
      // Large upload
      await sp.web.getFolderByServerRelativeUrl(folderPath).files.addChunked(file.name, file, (data) => {
        console.log({ data });
      }, true);
    }
  }

  /**
   * Create folder
   * @param listName List name
   * @param folderName Folder name
   */
  public static async createFolder(listName: string, folderName: string): Promise<void> {
    await sp.web.lists.getByTitle(listName).rootFolder.folders.add(folderName);
  }

  /**
   * Get files
   * @param folderPath Folder path
   * @returns Files
   */
  public static async getFiles(folderPath: string): Promise<any[]> {
    return await sp.web.getFolderByServerRelativeUrl(folderPath).files.get();
  }
}
