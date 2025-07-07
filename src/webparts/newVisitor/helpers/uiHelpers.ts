/**
 * Capitalizes the first letter of a string
 * @param name String to capitalize
 * @returns Capitalized string
 */
export function capitalize(name: string): string {
  if (!name || name.length === 0) return '';
  return name[0].toUpperCase() + name.slice(1);
}

/**
 * Checks if a field should be visible based on user role and form state
 * @param element Element name
 * @param visitor Visitor data
 * @param isEdit Edit mode
 * @param isEncoder Encoder role
 * @param isReceptionist Receptionist role
 * @param isApproverUser Approver role
 * @param isWalkinApproverUser Walkin approver role
 * @param isSSDUser SSD role
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
      return !isEdit && (forEncoder || forSSD);
    case 'approverSection':
      return forEncoder || forWalkinApprover || forApprover || forSSD;
    case 'remarks1':
      return forApprover || forWalkinApprover;
    case 'remarks2':
      return forSSD;
    case 'saveButton':
      return isEdit && (forEncoder || forReceptionist);
    case 'submitButton':
      return isEdit && (forEncoder || forReceptionist);
    case 'approveButton':
      return forApprover || forWalkinApprover || forSSD;
    case 'denyButton':
      return forApprover || forWalkinApprover || forSSD;
    case 'markCompleteButton':
      return forReceptionistCompletion;
    case 'closeButton':
      return !isEdit;
    default:
      return false;
  }
}
