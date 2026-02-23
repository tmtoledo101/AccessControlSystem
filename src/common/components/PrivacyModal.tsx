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
      // Always show whenever this component is mounted (open page, reload, etc.)
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
            Accept: 'application/json;odata=nometadata',
            'Content-type': 'application/json;odata=nometadata',
            'odata-version': ''
          },
          body: body
        }
      );

      if (response.ok) {
        const responseJson = await response.json();
        console.log(`Consent '${consentValue}' saved for ${currentUserEmail}. Item ID: ${responseJson.ID}`);

        // No localStorage write anymore (since modal should show again on reload/open)

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
      console.error('Error saving consent to SharePoint list:', error);
      this.setState({
        isSaving: false,
        saveError: 'An unexpected error occurred while saving your consent. Please try again.'
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
    const contentStackTokens: IStackTokens = { childrenGap: 14 };
    const buttonStackTokens: IStackTokens = { childrenGap: 24 };

    const stackStyles: IStackStyles = {
      root: {
        padding: '40px 60px',
        maxWidth: '720px',
        margin: '0 auto',
        textAlign: 'left' // better for long text
      }
    };

    const buttonStyles = {
      root: {
        width: '200px',
        height: '50px',
        fontSize: '16px',
        fontWeight: FontWeights.semibold
      },
      label: {
        fontWeight: FontWeights.semibold
      }
    };

    const titleStyles = {
      root: {
        fontSize: '32px',
        fontWeight: FontWeights.bold,
        marginBottom: '8px',
        color: '#323130',
        textAlign: 'center'
      }
    };

    const sectionTitleStyles = {
      root: {
        fontSize: '18px',
        fontWeight: FontWeights.semibold,
        marginTop: '6px',
        color: '#323130'
      }
    };

    const textStyles = {
      root: {
        fontSize: '14px',
        lineHeight: '22px',
        color: '#323130'
      }
    };

    const errorTextStyle = {
      root: {
        color: 'red',
        marginTop: '10px',
        fontWeight: FontWeights.semibold,
        textAlign: 'center'
      }
    };

    return (
      <Modal isOpen={isOpen} isBlocking={true} onDismiss={() => {}}>
        <Stack tokens={stackTokens} styles={stackStyles}>
          <Text styles={titleStyles}>Data Privacy Agreement</Text>

          <Stack tokens={contentStackTokens}>
            <Text styles={sectionTitleStyles}>Consent to the Collection and Processing of Personal Data</Text>
            <Text styles={textStyles}>
              I hereby voluntarily give my consent to the collection, use, storage, and processing of personal data for purposes related to
              documentation, verification, evaluation, and other legitimate activities necessary for this application/process, in accordance with
              the Data Privacy Act of 2012 and its Implementing Rules and Regulations.
            </Text>

            <Text styles={textStyles}>
              All personal information provided shall be treated with strict confidentiality and shall not be disclosed to unauthorized parties.
              Access to such information shall be limited to authorized personnel only and shall be used solely for the stated purposes.
            </Text>

            <Text styles={sectionTitleStyles}>Withdrawal of Consent</Text>
            <Text styles={textStyles}>
              I understand that I have the right to withdraw my consent at any time by submitting a written request to the Security Services
              Department. I acknowledge, however, that withdrawal of consent may affect the processing, approval, or continuation of my
              application/request where such personal data is necessary to fulfill the intended purpose or comply with legal and regulatory
              requirements.
            </Text>

            <Text styles={textStyles}>
              By proceeding with the submission of the request, application and/or documents, I confirm that I have read, understood, and agreed
              to this Data Privacy Agreement.
            </Text>
          </Stack>

          <Stack horizontal tokens={buttonStackTokens} horizontalAlign="center">
            <PrimaryButton
              text={isSaving ? 'SAVING...' : 'I AGREE'}
              onClick={this._onAccept}
              styles={buttonStyles}
              disabled={isSaving}
            />
            <DefaultButton
              text={isSaving ? 'SAVING...' : 'I DO NOT AGREE'}
              onClick={this._onDecline}
              styles={buttonStyles}
              disabled={isSaving}
            />
          </Stack>

          {saveError && <Text styles={errorTextStyle}>{saveError}</Text>}
        </Stack>
      </Modal>
    );
  }
}