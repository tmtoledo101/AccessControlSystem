/**
 * Capitalizes the first letter of a string
 * @param text Text to capitalize
 * @returns Capitalized text
 */
export function capitalize(text: string): string {
  if (!text) {
    return '';
  }
  
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Checks if a field should be visible based on user role and form state
 * @param element Element name
 * @param visitor Visitor data
 * @param isEdit Whether the form is in edit mode
 * @param isEncoder Whether the current user is an encoder
 * @param isReceptionist Whether the current user is a receptionist
 * @param isApproverUser Whether the current user is an approver
 * @param isWalkinApproverUser Whether the current user is a walkin approver
 * @param isSSDUser Whether the current user is an SSD user
 * @returns Whether the element should be visible
 */
export function checkVisibility(
  element: string, 
  visitor: any, 
  isEdit: boolean, 
  isEncoder: boolean, 
  isReceptionist: boolean, 
  isApproverUser: boolean, 
  isWalkinApproverUser: boolean, 
  isSSDUser: boolean
): boolean {
  const forApprover = isApproverUser && visitor.StatusId === 2;
  const forWalkinApprover = isWalkinApproverUser && visitor.StatusId === 2;
  const forSSD = isSSDUser && visitor.StatusId === 3;
  const forEncoder = isEncoder && (visitor.StatusId === 1 || visitor.StatusId === 2);
  const forReceptionist = isReceptionist && (visitor.StatusId === 1 || visitor.StatusId === 2);
  const forReceptionistCompletion = isReceptionist && (visitor.StatusId === 4 || visitor.StatusId === 9);
  
  switch (element) {
    case 'editicon':
      return !isEdit && (forEncoder || forReceptionist);
    case 'cedit':
      return isEdit && (forEncoder || forReceptionist);
    case 'cdisp':
      return !isEdit || (isEdit && !forEncoder && !forReceptionist);
    case 'deptdisp':
      return !isEdit || (isEdit && (forApprover || forSSD || forReceptionistCompletion || (isEncoder && visitor.StatusId === 2)));
    case 'deptedit':
      return isEdit && ((isEncoder && visitor.StatusId === 1) || forReceptionist);
    case 'requireparkingedit':
      return isEdit && (forEncoder || forReceptionist);
    case 'addfabdetail':
      return isEdit && (forReceptionist || forEncoder);
    case 'visitordetailsedit':
      return isEdit &&
       visitor.visitorDetailsList &&
       visitor.visitorDetailsList.length > 0 &&
       (forReceptionist || forEncoder);
    case 'visitordetailsdisp':
      return (!isEdit && visitor.visitorDetailsList && visitor.visitorDetailsList.length > 0) ||
       (isEdit && visitor.visitorDetailsList && visitor.visitorDetailsList.length > 0 &&
        (forSSD || forApprover || forReceptionistCompletion));
    case 'walkinapproversedit':
      return isEdit && isReceptionist && visitor.StatusId === 1;
    case 'approversedit':
      return isEdit && isEncoder && visitor.StatusId === 1;
    case 'approversdisp':
      return visitor.ApproverId !== null && (!isEdit || (isEdit && !forEncoder && !forReceptionist));
    case 'addmain1':
      return isEdit && (forEncoder || forReceptionist || forReceptionistCompletion);
    case 'addmain2':
      return isEdit && ((isEncoder && visitor.StatusId === 1) || (isReceptionist && visitor.StatusId === 1));
    case 'close':
      return !isEdit;
    case 'addapproval':
      return isEdit && (forApprover || forSSD);
    case 'remarks1disp':
      return !!visitor.Remarks1 && (!isEdit || (isEdit && !forApprover));
    case 'remarks2disp':
      return !!visitor.Remarks2 && (!isEdit || (isEdit && !forSSD));
    case 'ssddatedisp':
      return !!visitor.SSDDate && (!isEdit || isEdit);
    case 'deptdatedisp':
      return !!visitor.DeptApproverDate && (!isEdit || isEdit);
    case 'markcompletedatedisp':
      return !!visitor.MarkCompleteDate && (!isEdit || isEdit);
    case 'ssdapproverdisp':
      return !!visitor.SSDApproverId && (!isEdit || isEdit);
    case 'remarks1edit':
      return isEdit && forApprover;
    case 'remarks2edit':
      return isEdit && forSSD;
    case 'requestdatedisp':
      return !!visitor.RequestDate;
    case 'detailscaredit':
      return isEdit && (forEncoder || forReceptionist);
    case 'detailsidpresentededit':
      return isEdit && forReceptionistCompletion;
    case 'detailsidpresenteddisp':
      return !isEdit && !!visitor.IDPresented;
    case 'detailsgateedit':
      return isEdit && forReceptionistCompletion;
    case 'detailsgatedisp':
      return !isEdit && !!visitor.GateNo;
    case 'detailsaccesscardedit':
      return isEdit && forReceptionistCompletion;
    case 'detailsaccesscarddisp':
      return !isEdit && !!visitor.AccessCard;
    case 'dropzone2edit':
      return isEdit && forReceptionistCompletion;
    case 'dropzone2disp':
      return !isEdit && visitor.initFiles && visitor.initFiles.length > 0;
    case 'markcomplete':
      return isEdit && forReceptionistCompletion;
    default:
      return false;
  }
}
