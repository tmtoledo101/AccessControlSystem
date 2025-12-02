import { SharePointService } from "./SharePointService";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import { IEmailProperties } from "@pnp/sp/sputilities";

/**
 * List that Power Automate will watch
 */
const EMAIL_LIST_NAME = "EmailDataForPA";

/**
 * Save email data to SharePoint list.
 * Power Automate will use this to actually send the email.
 */
async function saveEmailData(emailProps: IEmailProperties, url: string): Promise<boolean> {
  try {
    // Extract reference number from subject, e.g. HO-20251113-001
    const subject: string = emailProps.Subject ? emailProps.Subject : "";
    const refNoMatch = subject.match(/([A-Z]{2,5}-\d{8}-\d{3})/);
    const referenceNo = refNoMatch ? refNoMatch[1] : "";

    console.log("Subject:", subject);
    console.log("Extracted RefNo:", referenceNo);

    const toArray: string[] = emailProps.To ? emailProps.To : [];
    const ccArray: string[] = emailProps.CC ? emailProps.CC : [];

    await sp.web.lists.getByTitle(EMAIL_LIST_NAME).items.add({
      ReferenceNo: referenceNo,
      To: [...new Set(toArray)].join(";"),
      CC: [...new Set(ccArray)].join(";"),
      Subject: subject,
      Body: emailProps.Body,
      RecordUrl: url
    });

    return true;
  } catch (error) {
    console.error("Failed to save email data:", error);
    return false;
  }
}

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
   * Builds IEmailProperties object
   */
  private buildEmailProps(
    from: string,
    to: string[],
    subject: string,
    body: string
  ): IEmailProperties {
    return {
      From: from,
      To: to,
      Subject: subject,
      Body: body,
      CC: [],
      AdditionalHeaders: {
        "content-type": "text/html"
      }
    };
  }

  /**
   * Sends an approval or confirmation email
   * by saving to EmailDataForPA list.
   * Power Automate will actually send the email.
   *
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
    const currentUser = await this.spService.getCurrentUser();
    const toEmails = [approverEmail];

    let subject = "";
    let body = "";

    const recordUrl = `${this.siteUrl}/sitePages/DisplayVisitorappge.aspx?pid=${itemId}`;

    if (isEncoder) {
      subject = `BSP ACCESS CONTROL SYSTEM : For Approval ${refNo} - ${purpose}`;
      body =
        `BSP Access Control System Request Notification.</br></br>` +
        `Ref No.:${refNo}</br>Purpose:${purpose}</br></br>` +
        `You may open the request by clicking on this ` +
        `<a href="${recordUrl}">link</a>`;
    } else {
      subject = `BSP ACCESS CONTROL SYSTEM : For Confirmation ${refNo} - ${purpose}`;
      body =
        `BSP Access Control System For Approval Notification.</br></br>` +
        `Ref No.:${refNo}</br>Purpose:${purpose}</br></br>` +
        `You may open the request by clicking on this ` +
        `<a href="${recordUrl}">link</a>`;
    }

    const emailProps = this.buildEmailProps(
      currentUser.Email,
      toEmails,
      subject,
      body
    );

    const ok = await saveEmailData(emailProps, recordUrl);
    if (!ok) {
      throw new Error(`Failed to save email data for subject: ${subject}`);
    }
  }
}
