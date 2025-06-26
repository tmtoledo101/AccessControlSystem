import { sp } from "@pnp/sp";
import "@pnp/sp/sputilities";
import { IEmailProperties } from "@pnp/sp/sputilities";
import { IOvertimeRequest } from "../models/IOvertimeRequest";

/**
 * Email service class
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
   * Sends email
   * @param toEmails To emails
   * @param subject Subject
   * @param body Body
   * @returns Promise
   */
  public async sendEmail(toEmails: string[], subject: string, body: string): Promise<void> {
    if (!toEmails || toEmails.length === 0) return;
    
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
   * Sends submission email
   * @param overtimeRequest Overtime request
   * @param approverEmail Approver email
   * @param approverName Approver name
   * @returns Promise
   */
  public async sendSubmissionEmail(
    overtimeRequest: IOvertimeRequest,
    approverEmail: string,
    approverName: string
  ): Promise<void> {
    const toEmails = [approverEmail];
    const subject = `BSP ACCESS CONTROL SYSTEM : For Approval ${overtimeRequest.Title} - ${overtimeRequest.Purpose}`;
    const body = `
      BSP Access Control System Request Notification.<br/><br/>
      Ref No.: ${overtimeRequest.Title}<br/>
      Purpose: ${overtimeRequest.Purpose}<br/><br/>
      You may open the request by clicking on this <a href="${this.siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${overtimeRequest.ID}">link</a>
    `;
    
    await this.sendEmail(toEmails, subject, body);
  }
  
  /**
   * Sends department approval email
   * @param overtimeRequest Overtime request
   * @param ssdUsers SSD users
   * @returns Promise
   */
  public async sendDepartmentApprovalEmail(
    overtimeRequest: IOvertimeRequest,
    ssdUsers: any[]
  ): Promise<void> {
    // Email to SSD users
    const ssdEmails = ssdUsers.map(user => user.Email);
    const ssdSubject = `BSP ACCESS CONTROL SYSTEM : For Approval ${overtimeRequest.Title} - ${overtimeRequest.Purpose}`;
    const ssdBody = `
      BSP Access Control System For Approval Notification.<br/><br/>
      Ref No.: ${overtimeRequest.Title}<br/>
      Purpose: ${overtimeRequest.Purpose}<br/><br/>
      You may open the request by clicking on this <a href="${this.siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${overtimeRequest.ID}">link</a>
    `;
    
    await this.sendEmail(ssdEmails, ssdSubject, ssdBody);
    
    // Email to requestor
    const requestorEmails = [overtimeRequest.Author.EMail];
    const requestorSubject = `BSP ACCESS CONTROL SYSTEM : Approved by ${overtimeRequest.Approver.Title} - ${overtimeRequest.Title}`;
    const requestorBody = `
      BSP Access Control System For Approval Notification.<br/><br/>
      Ref No.: ${overtimeRequest.Title}<br/>
      Purpose: ${overtimeRequest.Purpose}<br/><br/>
      You may open the request by clicking on this <a href="${this.siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${overtimeRequest.ID}">link</a>
    `;
    
    await this.sendEmail(requestorEmails, requestorSubject, requestorBody);
  }
  
  /**
   * Sends SSD approval email
   * @param overtimeRequest Overtime request
   * @returns Promise
   */
  public async sendSSDApprovalEmail(overtimeRequest: IOvertimeRequest): Promise<void> {
    const toEmails = [overtimeRequest.Author.EMail];
    const subject = `BSP ACCESS CONTROL SYSTEM : Approved by SSD - ${overtimeRequest.Title}`;
    const body = `
      BSP Access Control System For Approval Notification.<br/><br/>
      Ref No.: ${overtimeRequest.Title}<br/>
      Purpose: ${overtimeRequest.Purpose}<br/><br/>
      You may open the request by clicking on this <a href="${this.siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${overtimeRequest.ID}">link</a>
    `;
    
    await this.sendEmail(toEmails, subject, body);
  }
  
  /**
   * Sends department denial email
   * @param overtimeRequest Overtime request
   * @returns Promise
   */
  public async sendDepartmentDenialEmail(overtimeRequest: IOvertimeRequest): Promise<void> {
    const toEmails = [overtimeRequest.Author.EMail];
    const subject = `BSP ACCESS CONTROL SYSTEM : Disapproved by ${overtimeRequest.Approver.Title} - ${overtimeRequest.Title}`;
    const body = `
      BSP Access Control System For Approval Notification.<br/><br/>
      Ref No.: ${overtimeRequest.Title}<br/>
      Purpose: ${overtimeRequest.Purpose}<br/><br/>
      You may open the request by clicking on this <a href="${this.siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${overtimeRequest.ID}">link</a>
    `;
    
    await this.sendEmail(toEmails, subject, body);
  }
  
  /**
   * Sends SSD denial email
   * @param overtimeRequest Overtime request
   * @param currentUserName Current user name
   * @returns Promise
   */
  public async sendSSDDenialEmail(
    overtimeRequest: IOvertimeRequest,
    currentUserName: string
  ): Promise<void> {
    const toEmails = [overtimeRequest.Author.EMail];
    const subject = `BSP ACCESS CONTROL SYSTEM : Disapproved by SSD - ${currentUserName} - ${overtimeRequest.Title}`;
    const body = `
      BSP Access Control System For Approval Notification.<br/><br/>
      Ref No.: ${overtimeRequest.Title}<br/>
      Purpose: ${overtimeRequest.Purpose}<br/><br/>
      You may open the request by clicking on this <a href="${this.siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${overtimeRequest.ID}">link</a>
    `;
    
    await this.sendEmail(toEmails, subject, body);
  }
}
