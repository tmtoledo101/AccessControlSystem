import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import { IEmailProperties } from "@pnp/sp/sputilities";
import { IOvertimeRequest } from "../models/IOvertimeRequest";
import { IUser } from "../models/IUser";
import { STATUS } from "../constants/status";

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
 * Service for sending emails
 */
export class EmailService {
  /**
   * Helper to build IEmailProperties
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
        "content-type": "text/html"
      }
    };
  }

  /**
   * Sends an email notification
   * @param request The overtime request
   * @param action The action performed
   * @param currentUser The current user
   * @param siteUrl The site URL
   * @param ssdUsers The SSD users
   */
  public static async sendEmailNotification(
    request: IOvertimeRequest,
    action: string,
    currentUser: IUser,
    siteUrl: string,
    ssdUsers: IUser[] = []
  ): Promise<void> {
    const recordUrl = `${siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${request.ID}`;

    if (action === "submit" && request.StatusId === STATUS.PENDING_DEPT_APPROVAL) {
      // Email to approver
      const toEmails = [request.Approver.EMail];
      const subject = `BSP ACCESS CONTROL SYSTEM : For Approval ${request.Title} - ${request.Purpose}`;
      const body =
        `BSP Access Control System Request Notification.</br></br>` +
        `Ref No.:${request.Title}</br>Purpose:${request.Purpose}</br></br>` +
        `You may open the request by clicking on this ` +
        `<a href="${recordUrl}">link</a>`;

      const emailProps = this.buildEmailProps(currentUser.EMail, toEmails, subject, body);
      const ok = await saveEmailData(emailProps, recordUrl);
      if (!ok) {
        throw new Error(`Failed to save email data for subject: ${subject}`);
      }
    } else if (action === "approve" && request.StatusId === STATUS.PENDING_DEPT_APPROVAL) {
      // Email to SSD users
      const toSsdEmails = ssdUsers.map(user => user.EMail);
      let subject = `BSP ACCESS CONTROL SYSTEM : For Approval ${request.Title} - ${request.Purpose}`;
      let body =
        `BSP Access Control System For Approval Notification.</br></br>` +
        `Ref No.:${request.Title}</br>Purpose:${request.Purpose}</br></br>` +
        `You may open the request by clicking on this ` +
        `<a href="${recordUrl}">link</a>`;

      let emailProps = this.buildEmailProps(currentUser.EMail, toSsdEmails, subject, body);
      let ok = await saveEmailData(emailProps, recordUrl);
      if (!ok) {
        throw new Error(`Failed to save email data for subject: ${subject}`);
      }

      // Email to author
      const toAuthor = [request.Author.EMail];
      subject = `BSP ACCESS CONTROL SYSTEM : Approved by ${request.Approver.Title} - ${request.Title}`;
      body =
        `BSP Access Control System For Approval Notification.</br></br>` +
        `Ref No.:${request.Title}</br>Purpose:${request.Purpose}</br></br>` +
        `You may open the request by clicking on this ` +
        `<a href="${recordUrl}">link</a>`;

      emailProps = this.buildEmailProps(currentUser.EMail, toAuthor, subject, body);
      ok = await saveEmailData(emailProps, recordUrl);
      if (!ok) {
        throw new Error(`Failed to save email data for subject: ${subject}`);
      }
    } else if (action === "approve" && request.StatusId === STATUS.PENDING_SSD_APPROVAL) {
      // Email to author
      const toAuthor = [request.Author.EMail];
      const subject = `BSP ACCESS CONTROL SYSTEM : Approved by SSD - ${request.Title}`;
      const body =
        `BSP Access Control System For Approval Notification.</br></br>` +
        `Ref No.:${request.Title}</br>Purpose:${request.Purpose}</br></br>` +
        `You may open the request by clicking on this ` +
        `<a href="${recordUrl}">link</a>`;

      const emailProps = this.buildEmailProps(currentUser.EMail, toAuthor, subject, body);
      const ok = await saveEmailData(emailProps, recordUrl);
      if (!ok) {
        throw new Error(`Failed to save email data for subject: ${subject}`);
      }
    } else if (action === "deny" && request.StatusId === STATUS.PENDING_DEPT_APPROVAL) {
      // Email to author
      const toAuthor = [request.Author.EMail];
      const subject = `BSP ACCESS CONTROL SYSTEM : Disapproved by ${request.Approver.Title} - ${request.Title}`;
      const body =
        `BSP Access Control System For Approval Notification.</br></br>` +
        `Ref No.:${request.Title}</br>Purpose:${request.Purpose}</br></br>` +
        `You may open the request by clicking on this ` +
        `<a href="${recordUrl}">link</a>`;

      const emailProps = this.buildEmailProps(currentUser.EMail, toAuthor, subject, body);
      const ok = await saveEmailData(emailProps, recordUrl);
      if (!ok) {
        throw new Error(`Failed to save email data for subject: ${subject}`);
      }
    } else if (action === "deny" && request.StatusId === STATUS.PENDING_SSD_APPROVAL) {
      // Email to author
      const toAuthor = [request.Author.EMail];
      const subject = `BSP ACCESS CONTROL SYSTEM : Disapproved by SSD - ${currentUser.Title} - ${request.Title}`;
      const body =
        `BSP Access Control System For Approval Notification.</br></br>` +
        `Ref No.:${request.Title}</br>Purpose:${request.Purpose}</br></br>` +
        `You may open the request by clicking on this ` +
        `<a href="${recordUrl}">link</a>`;

      const emailProps = this.buildEmailProps(currentUser.EMail, toAuthor, subject, body);
      const ok = await saveEmailData(emailProps, recordUrl);
      if (!ok) {
        throw new Error(`Failed to save email data for subject: ${subject}`);
      }
    }
  }
}
