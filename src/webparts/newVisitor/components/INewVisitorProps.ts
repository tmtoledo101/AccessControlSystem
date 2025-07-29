import { WebPartContext } from "@microsoft/sp-webpart-base";

/**
 * New visitor props interface
 */
export interface INewVisitorProps {
  description: string;
  context: WebPartContext;
  siteUrl: string;
  siteRelativeUrl: string;
}
