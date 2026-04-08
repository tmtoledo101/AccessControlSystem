import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import { IEmailProperties } from "@pnp/sp/sputilities";
import { IVisitor } from "../models/IVisitor";
import { IApproverDetails } from "../models/IVisitor";
import { IVisitorDetails } from "../models/IVisitorDetails";

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

export class EmailService {
  private siteUrl: string;
  private currentUserEmail: string;

  constructor(siteUrl: string, currentUserEmail: string) {
    this.siteUrl = siteUrl;
    this.currentUserEmail = currentUserEmail;
  }

  private async sendEmail(
    toEmails: string[],
    subject: string,
    body: string,
    url: string
  ): Promise<void> {
    const emailProps: IEmailProperties = {
      From: this.currentUserEmail,
      To: toEmails,
      CC: [],
      Subject: subject,
      Body: body,
      AdditionalHeaders: {
        "content-type": "text/html"
      }
    };

    const ok = await saveEmailData(emailProps, url);
    if (!ok) {
      throw new Error(`Failed to save email data for subject: ${subject}`);
    }
  }

  /**
   * Sends an email notification based on the action and user role
   */
  public async sendNotification(
    action: string,
    visitor: IVisitor,
    approverDetails: IApproverDetails,
    isEncoder: boolean,
    isReceptionist: boolean,
    isApproverUser: boolean,
    isWalkinApproverUser: boolean,
    isSSDUser: boolean,
    ssdUsers: any[],
    visitorDetailsList?: IVisitorDetails[]
  ): Promise<void> {
    let toEmails: string[] = [];
    let subject = "";
    let body = "";
    const refNo = visitor.Title;
    const purpose = visitor.Purpose;
    const linkUrl = `${this.siteUrl}/sitePages/DisplayVisitorappge.aspx?pid=${visitor.ID}`;

    // Determine email recipients, subject, and body based on action and user role
    if (isEncoder && action === "submit" && visitor.StatusId === 1) {
      // Encoder submitting a request
      toEmails.push(approverDetails.email);
      subject = `BSP ACCESS CONTROL SYSTEM : For Approval ${refNo} - ${purpose}`;
      body =
        `BSP Access Control System Request Notification.</br></br>` +
        `Ref No.:${refNo}</br>Purpose:${purpose}</br></br>` +
        `You may open the request by clicking on this <a href="${linkUrl}">link</a>`;
    } else if (isReceptionist && action === "submit" && visitor.StatusId === 1) {
      // Receptionist submitting a request
      toEmails.push(approverDetails.email);
      subject = `BSP ACCESS CONTROL SYSTEM : For Confirmation ${refNo} - ${purpose}`;
      body =
        `BSP Access Control System For Approval Notification.</br></br>` +
        `Ref No.:${refNo}</br>Purpose:${purpose}</br></br>` +
        `You may open the request by clicking on this <a href="${linkUrl}">link</a>`;
    }

    // =========================================================
    // Dept Approver approves -> SSD ONLY
    // Handles both StatusId 2 and 3 (because your system sometimes sets 3)
    // IMPORTANT: do NOT notify Author here
    // =========================================================
    else if (
      isApproverUser &&
      action === "approve" &&
      (visitor.StatusId === 2 || visitor.StatusId === 3)
    ) {
      toEmails = (ssdUsers || [])
        .map((u: any) => String((u && (u.Email || u.EMail)) || "").trim())
        .filter((x: string) => !!x);

      // de-dupe
      toEmails = Array.from(new Set(toEmails));

      subject = `BSP ACCESS CONTROL SYSTEM : Approved by Dept Approver ${visitor.Approver.Title} - ${refNo} - ${purpose}`;
      body =
        `BSP Access Control System : Approved by Dept Approver.</br></br>` +
        `Ref No.:${refNo}</br>Purpose:${purpose}</br></br>` +
        `You may open the request by clicking on this <a href="${linkUrl}">link</a>`;
    }

    else if (isWalkinApproverUser && action === "approve" && visitor.StatusId === 2) {
      // Walkin approver approving a request
      toEmails.push(visitor.Author.EMail);
      subject = `BSP ACCESS CONTROL SYSTEM : Confirmed by ${visitor.Approver.Title} - ${refNo}`;
      body =
        `BSP Access Control System For Approval Notification.</br></br>` +
        `Ref No.:${refNo}</br>Purpose:${purpose}</br></br>` +
        `You may open the request by clicking on this <a href="${linkUrl}">link</a>`;
    }

    // =========================================================
    // SSD approves (StatusId = 4) -> notify Author + Dept Approver
    // =========================================================
    else if (isSSDUser && action === "approve" && visitor.StatusId === 4) {
      if (visitor.Author && (visitor.Author as any).EMail) {
        toEmails.push(String((visitor.Author as any).EMail).trim());
      }
      if (visitor.Approver && (visitor.Approver as any).EMail) {
        toEmails.push(String((visitor.Approver as any).EMail).trim());
      }

      toEmails = Array.from(new Set(toEmails)).filter((x) => !!x);
      subject = `BSP ACCESS CONTROL SYSTEM : Approved by SSD - ${refNo}`;

      body =
        `BSP Access Control System Notification : Approved By SSD.</br></br>` +
        `Ref No.:${refNo}</br>Purpose:${purpose}</br></br>` +
        `You may open the request by clicking on this <a href="${linkUrl}">link</a>`;
    }

    // =========================================================
    // FIX: SSD clicks SAVE (savedraft/save/submit) while record is already final (StatusId 4 or 7)
    // Notify Author + Dept Approver (covers Approved -> Disapproved then Save)
    // =========================================================
    else if (
      isSSDUser &&
      (action === "savedraft" || action === "save" || action === "submit") &&
      (visitor.StatusId === 4 || visitor.StatusId === 7)
    ) {
      if (visitor.Author && (visitor.Author as any).EMail) {
        toEmails.push(String((visitor.Author as any).EMail).trim());
      }
      if (visitor.Approver && (visitor.Approver as any).EMail) {
        toEmails.push(String((visitor.Approver as any).EMail).trim());
      }

      toEmails = Array.from(new Set(toEmails)).filter((x) => !!x);

      subject =
        visitor.StatusId === 4
          ? `BSP ACCESS CONTROL SYSTEM : Approved by SSD - ${refNo}`
          : `BSP ACCESS CONTROL SYSTEM : Disapproved by SSD - ${refNo}`;

      body =
        `BSP Access Control System Notification.</br></br>` +
        `Ref No.:${refNo}</br>Purpose:${purpose}</br></br>` +
        `You may open the request by clicking on this <a href="${linkUrl}">link</a>`;
    }

    // =========================================================
    // SSD denies (StatusId = 7) -> notify Author + Dept Approver
    // =========================================================
    else if (isSSDUser && action === "deny" && visitor.StatusId === 7) {
      let authorEmail = "";
      let approverEmail = "";

      if (visitor.Author && (visitor.Author as any).EMail) {
        authorEmail = String((visitor.Author as any).EMail).trim();
      }
      if (visitor.Approver && (visitor.Approver as any).EMail) {
        approverEmail = String((visitor.Approver as any).EMail).trim();
      }

      toEmails = Array.from(new Set([authorEmail, approverEmail])).filter((x) => !!x);

      subject = `BSP ACCESS CONTROL SYSTEM : Disapproved by SSD - ${refNo}`;
      body =
        `BSP Access Control System : Disapproved by SSD.</br></br>` +
        `Ref No.:${refNo}</br>Purpose:${purpose}</br></br>` +
        `You may open the request by clicking on this <a href="${linkUrl}">link</a>`;
    }

    //else if (isApproverUser && action === "deny" && visitor.StatusId === 2) {
    else if (isApproverUser && action === "deny") {
      // Department approver denying a request
      toEmails.push(visitor.Author.EMail);
      subject = `BSP ACCESS CONTROL SYSTEM : Disapproved by ${visitor.Approver.Title} - ${refNo}`;
      body =
        `BSP Access Control System For Approval Notification.</br></br>` +
        `Ref No.:${refNo}</br>Purpose:${purpose}</br></br>` +
        `You may open the request by clicking on this <a href="${linkUrl}">link</a>`;
    } else if (isWalkinApproverUser && action === "deny" && visitor.StatusId === 2) {
      // Walkin approver denying a request
      toEmails.push(visitor.Author.EMail);
      subject = `BSP ACCESS CONTROL SYSTEM : Disapproved by ${visitor.Approver.Title} - ${refNo}`;
      body =
        `BSP Access Control System For Approval Notification.</br></br>` +
        `Ref No.:${refNo}</br>Purpose:${purpose}</br></br>` +
        `You may open the request by clicking on this <a href="${linkUrl}">link</a>`;
    } else if (isSSDUser && action === "deny" && visitor.StatusId === 3) {
      // SSD denying a request (older status)
      toEmails.push(visitor.Author.EMail);
      subject = `BSP ACCESS CONTROL SYSTEM : Disapproved by SSD - ${refNo}`;
      body =
        `BSP Access Control System : Disapproved By SSD.</br></br>` +
        `Ref No.:${refNo}</br>Purpose:${purpose}</br></br>` +
        `You may open the request by clicking on this <a href="${linkUrl}">link</a>`;
    } else {
      // No email to send
      return;
    }

    // Send the email if there are recipients
    if (toEmails.length > 0) {
      await this.sendEmail(toEmails, subject, body, linkUrl);
    }
  }

  public getSuccessMessage(
    action: string,
    visitor: IVisitor,
    approverDetails: IApproverDetails,
    isEncoder: boolean,
    isReceptionist: boolean,
    isApproverUser: boolean,
    isWalkinApproverUser: boolean,
    isSSDUser: boolean
  ): string {
    let message = "Data has been saved successfully.";

    if ((isEncoder || isReceptionist) && action === "submit") {
      message += `\nAn email notification has been sent to approver ${approverDetails.name}.`;
    } else if (isApproverUser && (visitor.StatusId === 2 || visitor.StatusId === 3) && action === "approve") {
      message += "\nAn email notification has been sent to the SSD group.";
    } else if (isWalkinApproverUser && visitor.StatusId === 2 && action === "approve") {
      message += `\nAn email notification has been sent to requestor ${visitor.Author.Title}.`;
    } else if (isSSDUser && (visitor.StatusId === 4 || visitor.StatusId === 7)) {
      message += `\nAn email notification has been sent to requestor ${visitor.Author.Title}.`;
    } else if (action === "deny") {
      message += `\nAn email notification has been sent to requestor ${visitor.Author.Title}.`;
    }

    return message;
  }
}