/**
 * Interface for employee details
 */
export interface IEmployeeDetails {
  /**
   * The ID
   */
  ID: number;
  
  /**
   * The parent ID (overtime request ID)
   */
  ParentId: number;
  
  /**
   * The employee name
   */
  Title: string;
  
  /**
   * The employee number
   */
  EmpNo: string;
  
  /**
   * The employee type (BSP or Others)
   */
  Etype: string;
  
  /**
   * The other source (for non-BSP employees)
   */
  OtherSource: string;
  
  /**
   * The time from
   */
  TimeFrom: Date;
  
  /**
   * The time to
   */
  TimeTo: Date;
  
  /**
   * The files
   */
  Files: any[];
  
  /**
   * The initial files
   */
  initFiles: string[];
  
  /**
   * The original files
   */
  origFiles: any[];
  
  /**
   * Additional properties
   */
  [key: string]: any;
}

/**
 * Interface for employee details validation errors
 */
export interface IEmployeeDetailsErrors {
  /**
   * Time from error
   */
  TimeFrom: string;
  
  /**
   * Time to error
   */
  TimeTo: string;
  
  /**
   * Other source error
   */
  OtherSource: string;
  
  /**
   * Employee number error
   */
  EmpNo: string;
  
  /**
   * Employee type error
   */
  Etype: string;
  
  /**
   * Employee name error
   */
  Title: string;
  
  /**
   * Additional properties
   */
  [key: string]: string;
}
