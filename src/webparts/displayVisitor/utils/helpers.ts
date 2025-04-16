import moment from 'moment';

export const getUrlParameter = (name: string): string => {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

export const formatDateTime = (date: Date): string => {
    return moment(date).format('MM/DD/yyyy HH:mm');
};

export const formatDate = (date: Date): string => {
    return moment(date).format('MM/DD/yyyy');
};

export const isValidDateRange = (startDate: Date, endDate: Date): boolean => {
    return !moment(startDate).isAfter(endDate);
};

export const getStatusText = (statusId: number): string => {
    const statusMap = {
        1: 'Draft',
        2: 'For Approval',
        3: 'For SSD Approval',
        4: 'Approved',
        5: 'Completed',
        6: 'Denied by Dept',
        7: 'Denied by SSD',
        8: 'Denied by Walkin Approver',
        9: 'Approved by Walkin Approver'
    };
    return statusMap[statusId] || 'Unknown';
};

export const filterApprovers = (approvers: any[], currentUserId: number): any[] => {
    return approvers.filter(approver => approver.NameId !== currentUserId);
};

export const getFileExtension = (filename: string): string => {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
};

export const isImageFile = (filename: string): boolean => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
    const extension = getFileExtension(filename).toLowerCase();
    return imageExtensions.includes(extension);
};

export const getRequiredFields = (userType: string, statusId: number, action?: string): string[] => {
    const commonFields = [
        "Purpose", "DeptId", "Bldg", "RoomNo", "EmpNo", 
        "DateTimeVisit", "DateTimeArrival", "CompanyName", 
        "Address", "VisContactNo"
    ];

    if (userType === 'encoder' && (statusId === 1 || statusId === 2)) {
        return [...commonFields, 'ApproverId'];
    }

    if (userType === 'receptionist' && (statusId === 1 || statusId === 2)) {
        return [...commonFields, 'ApproverId'];
    }

    if (userType === 'approver' && statusId === 2 && action === 'deny') {
        return ['Remarks1'];
    }

    if (userType === 'walkinApprover' && statusId === 2 && action === 'deny') {
        return ['Remarks1'];
    }

    if (userType === 'ssd' && statusId === 3 && action === 'deny') {
        return ['Remarks2'];
    }

    return [];
};

export const checkAccessControl = (params: {
    action: string;
    isEdit: boolean;
    userType: string;
    statusId: number;
    hasApprover: boolean;
    hasRemarks: boolean;
    hasFiles: boolean;
}): boolean => {
    const { action, isEdit, userType, statusId, hasApprover, hasRemarks, hasFiles } = params;

    // Edit icon visibility
    if (action === 'editicon') {
        if (userType === 'encoder' && statusId === 1) return true;
        if (userType === 'receptionist' && (statusId === 1 || statusId === 4 || statusId === 9)) return true;
        if (userType === 'approver' && statusId === 2) return true;
        if (userType === 'ssd' && statusId === 3) return true;
        return false;
    }

    // Form fields visibility
    if (action.includes('edit')) {
        return isEdit && (
            (userType === 'encoder' && statusId === 1) ||
            (userType === 'receptionist' && statusId === 1) ||
            (userType === 'approver' && statusId === 2) ||
            (userType === 'ssd' && statusId === 3)
        );
    }

    // Display fields visibility
    if (action.includes('disp')) {
        if (!isEdit) return true;
        if (hasApprover && action === 'approversdisp') return true;
        if (hasRemarks && (action === 'remarks1disp' || action === 'remarks2disp')) return true;
        if (hasFiles && action === 'filesdisp') return true;
        return false;
    }

    return false;
};
