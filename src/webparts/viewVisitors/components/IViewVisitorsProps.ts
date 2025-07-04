/*export interface IViewVisitorsProps {
  description: string;
  siteUrl: string;
}
  */

import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface IViewVisitorsProps {
  description: string;
  context: WebPartContext;
  siteUrl: string;
  siteRelativeUrl: string;
}