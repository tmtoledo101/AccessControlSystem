import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/files";
import "@pnp/sp/folders";

/**
 * File service
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
   * Uploads files to a folder
   * @param folderName Folder name
   * @param files Files
   */
  public async uploadFiles(folderName: string, files: File[]): Promise<void> {
    const folderPath = `${this.siteRelativeUrl}/${folderName}`;
    
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
  }

  /**
   * Creates a folder
   * @param listName List name
   * @param folderName Folder name
   */
  public async createFolder(listName: string, folderName: string): Promise<void> {
    await sp.web.lists.getByTitle(listName).rootFolder.folders.add(folderName);
  }
}
