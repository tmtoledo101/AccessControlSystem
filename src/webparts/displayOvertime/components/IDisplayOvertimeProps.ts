import { WebPartContext } from "@microsoft/sp-webpart-base";
export interface IDisplayOvertimeProps {
  description: string;
  context: WebPartContext;
  siteUrl: string;
  siteRelativeUrl: string;
}
