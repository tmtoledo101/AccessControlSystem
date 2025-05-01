import { sp } from "@pnp/sp";
import "@pnp/sp/sputilities";
import { IEmailProperties } from "@pnp/sp/sputilities";
import { IVisitor } from "../models/IVisitor";
import { IApproverDetails } from "../models/IVisitor";

export class EmailService {
  private siteUrl: string;
  private currentUserEmail: string;

  constructor(siteUrl: string, currentUserEmail: string) {
    this.siteUrl = siteUrl;
    this.currentUserEmail = currentUserEmail;
  }

  /**
   * Sends an email notification
   * @param toEmails Array of recipient email addresses
   * @param subject Email subject
   * @param body Email body (HTML)
   */
  private async sendEmail(toEmails: string[], subject: string, body: string): Promise<void> {
    const emailProps: IEmailProperties = {
      From: this.currentUserEmail,
      To: toEmails,
      Subject: subject,
      Body: body,
      AdditionalHeaders: {
        "content-type": "text/html"
      }
    };

    await sp.utility.sendEmail(emailProps);
  }

  /**
   * Sends an email notification based on the action and user role
   * @param action Action being performed (submit, approve, deny)
   * @param visitor Visitor data
   * @param approverDetails Approver details
   * @param isEncoder Whether the current user is an encoder
   * @param isReceptionist Whether the current user is a receptionist
   * @param isApproverUser Whether the current user is an approver
   * @param isWalkinApproverUser Whether the current user is a walkin approver
   * @param isSSDUser Whether the current user is an SSD user
   * @param ssdUsers Array of SSD users
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
    ssdUsers: any[]
  ): Promise<void> {
    let toEmails: string[] = [];
    let subject: string = '';
    let body: string = '';
    const refNo = visitor.Title;
    const purpose = visitor.Purpose;
    const linkUrl = `${this.siteUrl}/sitePages/DisplayVisitorappge.aspx?pid=${visitor.ID}`;

    // Determine email recipients, subject, and body based on action and user role
    if ((isEncoder) && (action === 'submit') && (visitor.StatusId === 1)) {
      // Encoder submitting a request
      toEmails.push(approverDetails.email);
      subject = `BSP ACCESS CONTROL SYSTEM : For Approval ${refNo} - ${purpose}`;
      body = `BSP Access Control System Request Notification.</br></br>Ref No.:${refNo}</br>Purpose:${purpose}</br></br>You may open the request by clicking on this <a href="${linkUrl}">link</a>`;
    } else if ((isReceptionist) && (action === 'submit') && (visitor.StatusId === 1)) {
      // Receptionist submitting a request
      toEmails.push(approverDetails.email);
      subject = `BSP ACCESS CONTROL SYSTEM : For Confirmation ${refNo} - ${purpose}`;
      body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${refNo}</br>Purpose:${purpose}</br></br>You may open the request by clicking on this <a href="${linkUrl}">link</a>`;
    } else if ((isApproverUser) && (action === 'approve') && (visitor.StatusId === 2)) {
      // Department approver approving a request
      // Send to SSD users
      toEmails = ssdUsers.map(user => user.Email);
      subject = `BSP ACCESS CONTROL SYSTEM : For Approval ${refNo} - ${purpose}`;
      body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${refNo}</br>Purpose:${purpose}</br></br>You may open the request by clicking on this <a href="${linkUrl}">link</a>`;
      
      // Also notify the author
      await this.sendEmail(
        [visitor.Author.EMail],
        `BSP ACCESS CONTROL SYSTEM : Approved by ${visitor.Approver.Title} - ${refNo}`,
        `BSP Access Control System For Approval Notification.</br></br>Ref No.:${refNo}</br>Purpose:${purpose}</br></br>You may open the request by clicking on this <a href="${linkUrl}">link</a>`
      );
    } else if ((isWalkinApproverUser) && (action === 'approve') && (visitor.StatusId === 2)) {
      // Walkin approver approving a request
      toEmails.push(visitor.Author.EMail);
      subject = `BSP ACCESS CONTROL SYSTEM : Confirmed by ${visitor.Approver.Title} - ${refNo}`;
      body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${refNo}</br>Purpose:${purpose}</br></br>You may open the request by clicking on this <a href="${linkUrl}">link</a>`;
    } else if ((isSSDUser) && (action === 'approve') && (visitor.StatusId === 3)) {
      // SSD approving a request
      toEmails.push(visitor.Author.EMail);
      subject = `BSP ACCESS CONTROL SYSTEM : Approved by SSD - ${refNo}`;
      body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${refNo}</br>Purpose:${purpose}</br></br>You may open the request by clicking on this <a href="${linkUrl}">link</a>`;
    } else if ((isApproverUser) && (action === 'deny') && (visitor.StatusId === 2)) {
      // Department approver denying a request
      toEmails.push(visitor.Author.EMail);
      subject = `BSP ACCESS CONTROL SYSTEM : Disapproved by ${visitor.Approver.Title} - ${refNo}`;
      body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${refNo}</br>Purpose:${purpose}</br></br>You may open the request by clicking on this <a href="${linkUrl}">link</a>`;
    } else if ((isWalkinApproverUser) && (action === 'deny') && (visitor.StatusId === 2)) {
      // Walkin approver denying a request
      toEmails.push(visitor.Author.EMail);
      subject = `BSP ACCESS CONTROL SYSTEM : Disapproved by ${visitor.Approver.Title} - ${refNo}`;
      body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${refNo}</br>Purpose:${purpose}</br></br>You may open the request by clicking on this <a href="${linkUrl}">link</a>`;
    } else if ((isSSDUser) && (action === 'deny') && (visitor.StatusId === 3)) {
      // SSD denying a request
      toEmails.push(visitor.Author.EMail);
      subject = `BSP ACCESS CONTROL SYSTEM : Disapproved by SSD - ${refNo}`;
      body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${refNo}</br>Purpose:${purpose}</br></br>You may open the request by clicking on this <a href="${linkUrl}">link</a>`;
    } else {
      // No email to send
      return;
    }

    // Send the email if there are recipients
    if (toEmails.length > 0) {
      await this.sendEmail(toEmails, subject, body);
    }
  }

  /**
   * Gets a message for the success notification based on the action and user role
   * @param action Action being performed (submit, approve, deny)
   * @param visitor Visitor data
   * @param approverDetails Approver details
   * @param isEncoder Whether the current user is an encoder
   * @param isReceptionist Whether the current user is a receptionist
   * @param isApproverUser Whether the current user is an approver
   * @param isWalkinApproverUser Whether the current user is a walkin approver
   * @param isSSDUser Whether the current user is an SSD user
   * @returns Success message
   */
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

    if ((isEncoder || isReceptionist) && (action === 'submit')) {
      message += `\nAn email notification has been sent to approver ${approverDetails.name}.`;
    } else if ((isApproverUser) && (visitor.StatusId === 2) && (action === 'approve')) {
      message += "\nAn email notification has been sent to the SSD group.";
    } else if ((isWalkinApproverUser) && (visitor.StatusId === 2) && (action === 'approve')) {
      message += `\nAn email notification has been sent to requestor ${visitor.Author.Title}.`;
    } else if ((isSSDUser) && (visitor.StatusId === 3) && (action === 'approve')) {
      message += `\nAn email notification has been sent to requestor ${visitor.Author.Title}.`;
    } else if (action === 'deny') {
      message += `\nAn email notification has been sent to requestor ${visitor.Author.Title}.`;
    }

    return message;
  }
}
