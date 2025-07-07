import { sp } from "@pnp/sp";
import "@pnp/sp/files";
import "@pnp/sp/folders";

/**
 * File service for file operations
 */
export class FileService {
  private siteRelativeUrl: string;

  /**
   * Constructor
   * @param siteRelativeUrl Site relative URL
   */
  constructor(siteRelativeUrl: string) {
    this.siteRelativeUrl = siteRelativeUrl;
  }

  /**
   * Uploads visitor files
   * @param itemId Item ID
   * @param files Files to upload
   * @param origFiles Original files
   * @param deleteFiles Files to delete
   */
  public async uploadVisitorFiles(
    itemId: number,
    files: File[],
    origFiles: any[],
    deleteFiles: any[]
  ): Promise<void> {
    try {
      const folderPath = `${this.siteRelativeUrl}/VisitorsLib/${itemId}`;

      // Upload new files
      await Promise.all(files.map(async (file) => {
        if (file.size <= 10485760) {
          // Small upload
          await sp.web.getFolderByServerRelativeUrl(folderPath).files.add(file.name, file, true);
        } else {
          // Large upload
          await sp.web.getFolderByServerRelativeUrl(folderPath).files.addChunked(file.name, file, data => {
            console.log({ data });
          }, true);
        }
      }));

      // Delete files
      await Promise.all(deleteFiles.map(async (file) => {
        try {
          await sp.web.getFileByServerRelativeUrl(`${folderPath}/${file.Name}`).delete();
        } catch (error) {
          console.error(`Error deleting file ${file.Name}:`, error);
        }
      }));
    } catch (error) {
      console.error("Error uploading visitor files:", error);
      throw error;
    }
  }

  /**
   * Uploads visitor details files
   * @param itemId Item ID
   * @param files Files to upload
   * @param origFiles Original files
   */
  public async uploadVisitorDetailsFiles(
    itemId: number,
    files: File[],
    origFiles: any[]
  ): Promise<void> {
    try {
      const folderPath = `${this.siteRelativeUrl}/VisitorDetailsLib/${itemId}`;

      // Upload new files
      await Promise.all(files.map(async (file) => {
        if (file.size <= 10485760) {
          // Small upload
          await sp.web.getFolderByServerRelativeUrl(folderPath).files.add(file.name, file, true);
        } else {
          // Large upload
          await sp.web.getFolderByServerRelativeUrl(folderPath).files.addChunked(file.name, file, data => {
            console.log({ data });
          }, true);
        }
      }));
    } catch (error) {
      console.error("Error uploading visitor details files:", error);
      throw error;
    }
  }

  /**
   * Deletes visitor details files
   * @param deleteFiles Files to delete
   */
  public async deleteVisitorDetailsFiles(deleteFiles: any[]): Promise<void> {
    try {
      await Promise.all(deleteFiles.map(async (file) => {
        try {
          const folderPath = `${this.siteRelativeUrl}/VisitorDetailsLib/${file.Id}`;
          await sp.web.getFileByServerRelativeUrl(`${folderPath}/${file.Filename}`).delete();
        } catch (error) {
          console.error(`Error deleting file ${file.Filename}:`, error);
        }
      }));
    } catch (error) {
      console.error("Error deleting visitor details files:", error);
      throw error;
    }
  }

  /**
   * Gets files from a folder
   * @param folderPath Folder path
   * @returns Files
   */
  public async getFilesFromFolder(folderPath: string): Promise<any[]> {
    try {
      const files = await sp.web.getFolderByServerRelativeUrl(folderPath).files.get();
      return files;
    } catch (error) {
      console.error("Error getting files from folder:", error);
      return [];
    }
  }
}
