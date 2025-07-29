import { sp } from "@pnp/sp";
import "@pnp/sp/sputilities";
import { IEmailProperties } from "@pnp/sp/sputilities";
import { IOvertimeRequest } from "../models/IOvertimeRequest";
import { IUser } from "../models/IUser";
import { STATUS } from "../constants/status";

/**
 * Service for sending emails
 */
export class EmailService {
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
    let toEmails: string[] = [];
    let subject = '';
    let body = '';
    
    // Create email properties
    const emailProps: IEmailProperties = {
      From: currentUser.EMail,
      To: toEmails,
      Subject: subject,
      Body: body,
      AdditionalHeaders: {
        "content-type": "text/html"
      }
    };
    
    // Set email properties based on action and status
    if (action === 'submit' && request.StatusId === STATUS.PENDING_DEPT_APPROVAL) {
      // Email to approver
      toEmails.push(request.Approver.EMail);
      
      emailProps.To = toEmails;
      emailProps.Subject = `BSP ACCESS CONTROL SYSTEM : For Approval ${request.Title} - ${request.Purpose}`;
      emailProps.Body = `BSP Access Control System Request Notification.</br></br>Ref No.:${request.Title}</br>Purpose:${request.Purpose}</br></br>You may open the request by clicking on this <a href="${siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${request.ID}">link</a>`;
      
      await sp.utility.sendEmail(emailProps);
    } 
    else if (action === 'approve' && request.StatusId === STATUS.PENDING_DEPT_APPROVAL) {
      // Email to SSD users
      toEmails = ssdUsers.map(user => user.EMail);
      
      emailProps.To = toEmails;
      emailProps.Subject = `BSP ACCESS CONTROL SYSTEM : For Approval ${request.Title} - ${request.Purpose}`;
      emailProps.Body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${request.Title}</br>Purpose:${request.Purpose}</br></br>You may open the request by clicking on this <a href="${siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${request.ID}">link</a>`;
      
      await sp.utility.sendEmail(emailProps);
      
      // Email to author
      toEmails = [request.Author.EMail];
      
      emailProps.To = toEmails;
      emailProps.Subject = `BSP ACCESS CONTROL SYSTEM : Approved by ${request.Approver.Title} - ${request.Title}`;
      emailProps.Body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${request.Title}</br>Purpose:${request.Purpose}</br></br>You may open the request by clicking on this <a href="${siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${request.ID}">link</a>`;
      
      await sp.utility.sendEmail(emailProps);
    } 
    else if (action === 'approve' && request.StatusId === STATUS.PENDING_SSD_APPROVAL) {
      // Email to author
      toEmails = [request.Author.EMail];
      
      emailProps.To = toEmails;
      emailProps.Subject = `BSP ACCESS CONTROL SYSTEM : Approved by SSD - ${request.Title}`;
      emailProps.Body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${request.Title}</br>Purpose:${request.Purpose}</br></br>You may open the request by clicking on this <a href="${siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${request.ID}">link</a>`;
      
      await sp.utility.sendEmail(emailProps);
    } 
    else if (action === 'deny' && request.StatusId === STATUS.PENDING_DEPT_APPROVAL) {
      // Email to author
      toEmails = [request.Author.EMail];
      
      emailProps.To = toEmails;
      emailProps.Subject = `BSP ACCESS CONTROL SYSTEM : Disapproved by ${request.Approver.Title} - ${request.Title}`;
      emailProps.Body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${request.Title}</br>Purpose:${request.Purpose}</br></br>You may open the request by clicking on this <a href="${siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${request.ID}">link</a>`;
      
      await sp.utility.sendEmail(emailProps);
    } 
    else if (action === 'deny' && request.StatusId === STATUS.PENDING_SSD_APPROVAL) {
      // Email to author
      toEmails = [request.Author.EMail];
      
      emailProps.To = toEmails;
      emailProps.Subject = `BSP ACCESS CONTROL SYSTEM : Disapproved by SSD - ${currentUser.Title} - ${request.Title}`;
      emailProps.Body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${request.Title}</br>Purpose:${request.Purpose}</br></br>You may open the request by clicking on this <a href="${siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${request.ID}">link</a>`;
      
      await sp.utility.sendEmail(emailProps);
    }
  }
}
