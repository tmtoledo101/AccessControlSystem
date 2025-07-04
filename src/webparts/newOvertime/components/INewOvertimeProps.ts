import { WebPartContext } from "@microsoft/sp-webpart-base";
export interface INewOvertimeProps {
  description: string;
  context: WebPartContext;
  siteUrl: string;
  siteRelativeUrl: string;
}
