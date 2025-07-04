import { sp } from "@pnp/sp";
import "@pnp/sp/files";
import "@pnp/sp/folders";

/**
 * Service for handling file operations
 */
export class FileService {
  /**
   * Uploads files to a folder
   * @param folderPath The folder path
   * @param files The files to upload
   * @param originalFiles The original files
   * @returns The deleted files
   */
  public static async uploadFiles(
    folderPath: string,
    files: File[],
    originalFiles: any[]
  ): Promise<any[]> {
    const deletedFiles = [];
    
    // Check for deleted files
    if (originalFiles && originalFiles.length > 0) {
      originalFiles.forEach(originalFile => {
        const fileExists = files.some(file => file.name === originalFile.Name);
        if (!fileExists) {
          deletedFiles.push(originalFile);
        }
      });
    }
    
    // Upload new files
    if (files && files.length > 0) {
      await Promise.all(files.map(async (file) => {
        const fileExists = originalFiles.some(originalFile => originalFile.Name === file.name);
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
    
    return deletedFiles;
  }
  
  /**
   * Deletes files
   * @param folderPath The folder path
   * @param files The files to delete
   */
  public static async deleteFiles(folderPath: string, files: any[]): Promise<void> {
    if (files && files.length > 0) {
      await Promise.all(files.map(async (file) => {
        const fullPath = `${folderPath}/${file.Name}`;
        await sp.web.getFolderByServerRelativeUrl(fullPath).delete();
      }));
    }
  }
}
