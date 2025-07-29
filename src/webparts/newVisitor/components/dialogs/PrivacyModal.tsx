import * as React from 'react';
import {
  Modal,
  PrimaryButton,
  DefaultButton,
  Text,
  Stack,
  IStackTokens,
  IStackStyles,
  FontWeights
} from 'office-ui-fabric-react';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
// Define a type for the context specific to what you need
export interface IWebPartContext {
  pageContext: {
    user: {
      email: string;
    };
    web: {
      absoluteUrl: string;
    };
  };
  spHttpClient: SPHttpClient;
}
export interface IPrivacyModalProps {
  onAccept: () => void;
  onDecline: () => void;
  context: IWebPartContext;
  refNo: string;
}
export interface IPrivacyModalState {
  isOpen: boolean;
  isSaving: boolean;
  saveError: string | null;
}
export default class PrivacyModal extends React.Component<IPrivacyModalProps, IPrivacyModalState> {
  constructor(props: IPrivacyModalProps) {
    super(props);
    this.state = {
      isOpen: true,
      isSaving: false,
      saveError: null
    };
  }
  private _saveConsent = async (consentValue: string): Promise<void> => {
    this.setState({ isSaving: true, saveError: null });
    const { context } = this.props;
    const currentUserEmail = context.pageContext.user.email;
    const webAbsoluteUrl = context.pageContext.web.absoluteUrl;
    const listName = 'PrivacyConsents';
    const restApiUrl: string = `${webAbsoluteUrl}/_api/web/lists/getByTitle('${listName}')/items`;
    const body: string = JSON.stringify({
      Title: `${currentUserEmail} - ${consentValue} on ${new Date().toLocaleDateString('en-US')}`,
      ConsentDate: new Date().toISOString(),
      ConsentValue: consentValue,
      UserEmail: currentUserEmail,
      RefNo: this.props.refNo
    });
    try {
      const response: SPHttpClientResponse = await context.spHttpClient.post(
        restApiUrl,
        SPHttpClient.configurations.v1,
        {
          headers: {
            'Accept': 'application/json;odata=nometadata',
            'Content-type': 'application/json;odata=nometadata',
            'odata-version': ''
          },
          body: body
        }
      );
      if (response.ok) {
        const responseJson = await response.json();
        console.log(`Consent '${consentValue}' saved for ${currentUserEmail}. Item ID: ${responseJson.ID}`);
        this.setState({ isOpen: false, isSaving: false }, () => {
          if (consentValue === 'Accepted') {
            this.props.onAccept();
          } else {
            this.props.onDecline();
          }
        });
      } else {
        const errorText = await response.text();
        console.error(`Error saving consent. Status: ${response.status}, Error: ${errorText}`);
        this.setState({ isSaving: false, saveError: `Failed to save your consent. Error: ${response.statusText}` });
      }
    } catch (error) {
      console.error("Error saving consent to SharePoint list:", error);
      this.setState({
        isSaving: false,
        saveError: "An unexpected error occurred while saving your consent. Please try again."
      });
    }
  }
  private _onAccept = async (): Promise<void> => {
    await this._saveConsent('Accepted');
  }
  private _onDecline = async (): Promise<void> => {
    await this._saveConsent('Declined');
  }
  public render(): React.ReactElement<any> {
    const { isSaving, saveError, isOpen } = this.state;
    const stackTokens: IStackTokens = { childrenGap: 20 };
    const contentStackTokens: IStackTokens = { childrenGap: 16 };
    const buttonStackTokens: IStackTokens = { childrenGap: 24 };
    const stackStyles: IStackStyles = {
      root: {
        padding: '40px 60px',
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center',
      }
    };
    const buttonStyles = {
      root: {
        width: '200px',
        height: '50px',
        fontSize: '16px',
        fontWeight: FontWeights.semibold,
      },
      label: {
        fontWeight: FontWeights.semibold,
      }
    };
    const titleStyles = {
      root: {
        fontSize: '36px',
        fontWeight: FontWeights.bold,
        marginBottom: '20px',
        color: '#323130'
      }
    };
    const textStyles = {
      root: {
        fontSize: '16px',
        lineHeight: '24px',
        color: '#323130',
        marginBottom: '10px'
      }
    };
    const errorTextStyle = {
      root: {
        color: 'red',
        marginTop: '10px',
        fontWeight: FontWeights.semibold
      }
    };
    return React.createElement(Modal, {
      isOpen: isOpen,
      isBlocking: true, // Always block interaction
      onDismiss: () => {} // Disable ESC or overlay click dismiss
    },
      React.createElement(Stack, { tokens: stackTokens, styles: stackStyles, horizontalAlign: 'center' },
        React.createElement(Text, { styles: titleStyles }, 'Privacy Notice'),
        React.createElement(Stack, { tokens: contentStackTokens },
          React.createElement(Text, { styles: textStyles },
            `Our site collects and stores information about you, your preferences and behavior, and your device to analyze website traffic, personalize content and ads, and provide social media features.`
          ),
          React.createElement(Text, { styles: textStyles },
            `Because we care about your privacy, you can decide whether to allow or reject the use of this technology.`
          )
        ),
        React.createElement(Stack, { horizontal: true, tokens: buttonStackTokens, horizontalAlign: 'center' },
          React.createElement(PrimaryButton, {
            text: isSaving ? 'SAVING...' : 'ACCEPT ALL',
            onClick: this._onAccept,
            styles: buttonStyles,
            disabled: isSaving
          }),
          React.createElement(DefaultButton, {
            text: isSaving ? 'SAVING...' : 'DECLINE ALL',
            onClick: this._onDecline,
            styles: buttonStyles,
            disabled: isSaving
          })
        ),
        saveError && React.createElement(Text, { styles: errorTextStyle }, saveError)
      )
    );
  }
}