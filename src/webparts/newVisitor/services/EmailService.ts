import { sp } from "@pnp/sp";
import "@pnp/sp/sputilities";
import { IEmailProperties } from "@pnp/sp/sputilities";
import { IVisitor } from "../models/IVisitor";
import { IVisitorDetails } from "../models/IVisitorDetails";
import { IApproverDetails } from "../models/IVisitor";

/**
 * Email service for sending notifications
 */
export class EmailService {
  private siteUrl: string;
  private currentUserEmail: string;

  /**
   * Constructor
   * @param siteUrl Site URL
   * @param currentUserEmail Current user email
   */
  constructor(siteUrl: string, currentUserEmail: string) {
    this.siteUrl = siteUrl;
    this.currentUserEmail = currentUserEmail;
  }

  /**
   * Sends a notification email
   * @param action Action type
   * @param visitor Visitor data
   * @param approverDetails Approver details
   * @param isEncoder Encoder role
   * @param isReceptionist Receptionist role
   * @param isApproverUser Approver role
   * @param isWalkinApproverUser Walkin approver role
   * @param isSSDUser SSD role
   * @param SSDUsers SSD users
   * @param visitorDetailsList Visitor details list
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
    SSDUsers: any[],
    visitorDetailsList: IVisitorDetails[]
  ): Promise<void> {
    try {
      let toEmail: string[] = [];
      let subject = "";
      let body = "";

      // Determine email recipients, subject, and body based on action and user role
      if (action === 'submit') {
        if (isEncoder || isReceptionist) {
          toEmail.push(approverDetails.email);
          subject = `BSP ACCESS CONTROL SYSTEM : For Approval ${visitor.Title} - ${visitor.Purpose}`;
          body = `BSP Access Control System Request Notification.</br></br>Ref No.:${visitor.Title}</br>Purpose:${visitor.Purpose}</br></br>You may open the request by clicking on this <a href="${this.siteUrl}/sitePages/DisplayVisitorappge.aspx?pid=${visitor.ID}">link</a>`;
        }
      } else if (action === 'approve') {
        if (isApproverUser || isWalkinApproverUser) {
          // Send to SSD users
          toEmail = SSDUsers.map(user => user.Email);
          subject = `BSP ACCESS CONTROL SYSTEM : For Approval ${visitor.Title} - ${visitor.Purpose}`;
          body = `BSP Access Control System Request Notification.</br></br>Ref No.:${visitor.Title}</br>Purpose:${visitor.Purpose}</br></br>You may open the request by clicking on this <a href="${this.siteUrl}/sitePages/DisplayVisitorappge.aspx?pid=${visitor.ID}">link</a>`;
        } else if (isSSDUser) {
          // Send to receptionist
          toEmail.push(visitor.Author.EMail);
          subject = `BSP ACCESS CONTROL SYSTEM : Approved ${visitor.Title} - ${visitor.Purpose}`;
          body = `BSP Access Control System Request Notification.</br></br>Ref No.:${visitor.Title}</br>Purpose:${visitor.Purpose}</br></br>Your request has been approved. You may open the request by clicking on this <a href="${this.siteUrl}/sitePages/DisplayVisitorappge.aspx?pid=${visitor.ID}">link</a>`;
        }
      } else if (action === 'deny') {
        if (isApproverUser || isWalkinApproverUser || isSSDUser) {
          // Send to requester
          toEmail.push(visitor.Author.EMail);
          subject = `BSP ACCESS CONTROL SYSTEM : Denied ${visitor.Title} - ${visitor.Purpose}`;
          body = `BSP Access Control System Request Notification.</br></br>Ref No.:${visitor.Title}</br>Purpose:${visitor.Purpose}</br></br>Your request has been denied. You may open the request by clicking on this <a href="${this.siteUrl}/sitePages/DisplayVisitorappge.aspx?pid=${visitor.ID}">link</a>`;
        }
      } else if (action === 'markcomplete') {
        if (isReceptionist) {
          // Send to requester
          toEmail.push(visitor.Author.EMail);
          subject = `BSP ACCESS CONTROL SYSTEM : Completed ${visitor.Title} - ${visitor.Purpose}`;
          body = `BSP Access Control System Request Notification.</br></br>Ref No.:${visitor.Title}</br>Purpose:${visitor.Purpose}</br></br>Your request has been completed. You may open the request by clicking on this <a href="${this.siteUrl}/sitePages/DisplayVisitorappge.aspx?pid=${visitor.ID}">link</a>`;
        }
      }

      // Send email if recipients are defined
      if (toEmail.length > 0) {
        const emailProps: IEmailProperties = {
          From: this.currentUserEmail,
          To: toEmail,
          Subject: subject,
          Body: body,
          AdditionalHeaders: {
            "content-type": "text/html"
          }
        };

        await sp.utility.sendEmail(emailProps);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  /**
   * Gets a success message for the notification
   * @param action Action type
   * @param visitor Visitor data
   * @param approverDetails Approver details
   * @param isEncoder Encoder role
   * @param isReceptionist Receptionist role
   * @param isApproverUser Approver role
   * @param isWalkinApproverUser Walkin approver role
   * @param isSSDUser SSD role
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
    let message = "";

    if (action === 'submit') {
      if (isEncoder || isReceptionist) {
        message = `An email notification has been sent to ${approverDetails.name}.`;
      }
    } else if (action === 'approve') {
      if (isApproverUser || isWalkinApproverUser) {
        message = "An email notification has been sent to SSD.";
      } else if (isSSDUser) {
        message = `An email notification has been sent to ${visitor.Author.Title}.`;
      }
    } else if (action === 'deny') {
      if (isApproverUser || isWalkinApproverUser || isSSDUser) {
        message = `An email notification has been sent to ${visitor.Author.Title}.`;
      }
    } else if (action === 'markcomplete') {
      if (isReceptionist) {
        message = `An email notification has been sent to ${visitor.Author.Title}.`;
      }
    }

    return message;
  }
}
