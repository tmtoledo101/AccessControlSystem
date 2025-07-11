import { SharePointService } from "./SharePointService";
import { sp } from "@pnp/sp";
import "@pnp/sp/sputilities";
import { IEmailProperties } from "@pnp/sp/sputilities";

/**
 * Email service
 */
export class EmailService {
  private spService: SharePointService;
  private siteUrl: string;

  /**
   * Constructor
   * @param spService SharePoint service
   * @param siteUrl Site URL
   */
  constructor(spService: SharePointService, siteUrl: string) {
    this.spService = spService;
    this.siteUrl = siteUrl;
  }

  /**
   * Sends an approval email
   * @param refNo Reference number
   * @param purpose Purpose
   * @param itemId Item ID
   * @param approverEmail Approver email
   * @param approverName Approver name
   * @param isEncoder Whether the user is an encoder
   */
  public async sendApprovalEmail(
    refNo: string,
    purpose: string,
    itemId: number,
    approverEmail: string,
    approverName: string,
    isEncoder: boolean
  ): Promise<void> {
    const currentUser = this.spService.getCurrentUser();
    const toEmails = [approverEmail];
    let subject = "";
    let body = "";

    if (isEncoder) {
      subject = `BSP ACCESS CONTROL SYSTEM : For Approval ${refNo} - ${purpose}`;
      body = `BSP Access Control System Request Notification.</br></br>Ref No.:${refNo}</br>Purpose:${purpose}</br></br>You may open the request by clicking on this <a href="${this.siteUrl}/sitePages/DisplayVisitorappge.aspx?pid=${itemId}">link</a>`;
    } else {
      subject = `BSP ACCESS CONTROL SYSTEM : For Confirmation ${refNo} - ${purpose}`;
      body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${refNo}</br>Purpose:${purpose}</br></br>You may open the request by clicking on this <a href="${this.siteUrl}/sitePages/DisplayVisitorappge.aspx?pid=${itemId}">link</a>`;
    }

    const emailProps: IEmailProperties = {
      From: currentUser.Email,
      To: toEmails,
      Subject: subject,
      Body: body,
      AdditionalHeaders: {
        "content-type": "text/html"
      }
    };

    await sp.utility.sendEmail(emailProps);
  }
}
