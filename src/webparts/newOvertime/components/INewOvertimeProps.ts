import { WebPartContext } from '@microsoft/sp-webpart-base';

/**
 * New overtime props interface
 */
export interface INewOvertimeProps {
  /**
   * Description
   */
  description: string;
  
  /**
   * Context
   */
  context: WebPartContext;
  
  /**
   * Site URL
   */
  siteUrl: string;
  
  /**
   * Site relative URL
   */
  siteRelativeUrl: string;
}
