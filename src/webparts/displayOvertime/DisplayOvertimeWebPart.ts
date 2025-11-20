import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'DisplayOvertimeWebPartStrings';
import DisplayOvertime from './components/DisplayOvertime';
import { IDisplayOvertimeProps } from './components/IDisplayOvertimeProps';
import { sp } from '@pnp/sp';
import { SPComponentLoader } from '@microsoft/sp-loader';

export interface IDisplayOvertimeWebPartProps {
  description: string;
}

export default class DisplayOvertimeWebPart extends BaseClientSideWebPart<IDisplayOvertimeWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IDisplayOvertimeProps> = React.createElement(
      DisplayOvertime,
      {
        description: this.properties.description,
        context: this.context,
        siteUrl: this.context.pageContext.web.absoluteUrl,
        siteRelativeUrl: this.context.pageContext.web.serverRelativeUrl
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }
  protected onInit(): Promise<void> {

    return super.onInit().then(_ => {
      SPComponentLoader.loadCss('https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap');
      SPComponentLoader.loadCss('https://fonts.googleapis.com/icon?family=Material+Icons');

      sp.setup({
        spfxContext: this.context,
        sp: {

          headers: {
            Accept: "application/json;odata=verbose",
          },
          baseUrl: this.context.pageContext.web.absoluteUrl,
        },
      });

    });
  }
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
