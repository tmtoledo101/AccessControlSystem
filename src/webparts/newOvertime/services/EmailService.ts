import { sp } from '@pnp/sp';
import '@pnp/sp/sputilities';
import { IEmailProperties } from '@pnp/sp/sputilities';

/**
 * Email service
 */
export class EmailService {
  /**
   * Send email
   * @param from From email
   * @param to To email
   * @param subject Subject
   * @param body Body
   */
  public static async sendEmail(
    from: string,
    to: string[],
    subject: string,
    body: string
  ): Promise<void> {
    const emailProps: IEmailProperties = {
      From: from,
      To: to,
      Subject: subject,
      Body: body,
      AdditionalHeaders: {
        'content-type': 'text/html'
      }
    };

    await sp.utility.sendEmail(emailProps);
  }

  /**
   * Send approval email
   * @param fromEmail From email
   * @param toEmail To email
   * @param refNo Reference number
   * @param purpose Purpose
   * @param siteUrl Site URL
   * @param itemId Item ID
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
    const body = `BSP Access Control System Request Notification.</br></br>Ref No.:${refNo}</br>Purpose:${purpose}</br></br>You may open the request by clicking on this <a href="${siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${itemId}">link</a>`;

    await this.sendEmail(fromEmail, [toEmail], subject, body);
  }

  /**
   * Send confirmation email
   * @param fromEmail From email
   * @param toEmail To email
   * @param refNo Reference number
   * @param purpose Purpose
   * @param siteUrl Site URL
   * @param itemId Item ID
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
    const body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${refNo}</br>Purpose:${purpose}</br></br>You may open the request by clicking on this <a href="${siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${itemId}">link</a>`;

    await this.sendEmail(fromEmail, [toEmail], subject, body);
  }
}
