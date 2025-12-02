import { sp } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import { IEmailProperties } from '@pnp/sp/sputilities';

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
  /**
   * Internal helper to build IEmailProperties object
   */
  private static buildEmailProps(
    from: string,
    to: string[],
    subject: string,
    body: string,
    cc: string[] = []
  ): IEmailProperties {
    return {
      From: from,
      To: to,
      CC: cc,
      Subject: subject,
      Body: body,
      AdditionalHeaders: {
        'content-type': 'text/html'
      }
    };
  }

  /**
   * "Send" email by saving to EmailDataForPA list
   * Power Automate will actually send the email
   */
  public static async sendEmail(
    from: string,
    to: string[],
    subject: string,
    body: string,
    url: string,
    cc: string[] = []
  ): Promise<void> {
    const emailProps = this.buildEmailProps(from, to, subject, body, cc);

    const ok = await saveEmailData(emailProps, url);
    if (!ok) {
      throw new Error(`Failed to save email data for subject: ${subject}`);
    }
  }

  /**
   * Send approval email
   */
  public static async sendApprovalEmail(
    fromEmail: string,
    toEmail: string,
    refNo: string,
    purpose: string,
    siteUrl: string,
    itemId: number
  ): Promise<void> {
    const subject = `BSP ACCESS CONTROL SYSTEM : For Approval ${refNo} - ${purpose}`;
    const body =
      `BSP Access Control System Request Notification.</br></br>` +
      `Ref No.:${refNo}</br>Purpose:${purpose}</br></br>` +
      `You may open the request by clicking on this ` +
      `<a href="${siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${itemId}">link</a>`;

    const recordUrl = `${siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${itemId}`;

    await this.sendEmail(fromEmail, [toEmail], subject, body, recordUrl);
  }

  /**
   * Send confirmation email
   */
  public static async sendConfirmationEmail(
    fromEmail: string,
    toEmail: string,
    refNo: string,
    purpose: string,
    siteUrl: string,
    itemId: number
  ): Promise<void> {
    const subject = `BSP ACCESS CONTROL SYSTEM : For Confirmation ${refNo} - ${purpose}`;
    const body =
      `BSP Access Control System For Approval Notification.</br></br>` +
      `Ref No.:${refNo}</br>Purpose:${purpose}</br></br>` +
      `You may open the request by clicking on this ` +
      `<a href="${siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${itemId}">link</a>`;

    const recordUrl = `${siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${itemId}`;

    await this.sendEmail(fromEmail, [toEmail], subject, body, recordUrl);
  }
}
