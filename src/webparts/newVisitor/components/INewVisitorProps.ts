import { WebPartContext } from "@microsoft/sp-webpart-base";
export interface INewVisitorProps {
  description: string;
  context: WebPartContext;
  siteUrl: string;
  siteRelativeUrl: string;
}
