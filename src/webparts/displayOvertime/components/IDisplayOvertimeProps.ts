import { SPHttpClient } from '@microsoft/sp-http';

/**
 * Interface for DisplayOvertime component props
 */
export interface IDisplayOvertimeProps {
  /**
   * The site URL
   */
  siteUrl: string;
  
  /**
   * The site relative URL
   */
  siteRelativeUrl: string;
  
  /**
   * The context
   */
  context?: any;
  
  /**
   * The SP HTTP client
   */
  spHttpClient?: SPHttpClient;
}
