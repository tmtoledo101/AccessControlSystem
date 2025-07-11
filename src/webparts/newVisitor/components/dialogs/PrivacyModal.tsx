import * as React from 'react';
import { Modal, PrimaryButton, DefaultButton, Text, Stack, IStackTokens, IStackStyles, FontWeights } from 'office-ui-fabric-react'; // Added FontWeights

export interface IPrivacyModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

export interface IPrivacyModalState {
  isOpen: boolean;
}

export default class PrivacyModal extends React.Component<IPrivacyModalProps, IPrivacyModalState> {
  constructor(props: IPrivacyModalProps) {
    super(props);
    this.state = { isOpen: true };
  }

  private _onAccept = (): void => {
    this.setState({ isOpen: false });
    this.props.onAccept();
  };

  private _onDecline = (): void => {
    this.setState({ isOpen: false });
    this.props.onDecline();
  };

  public render(): React.ReactElement<any> {
    const stackTokens: IStackTokens = { childrenGap: 20 }; // Increased gap for better spacing
    const contentStackTokens: IStackTokens = { childrenGap: 16 }; // Gap for text paragraphs
    const buttonStackTokens: IStackTokens = { childrenGap: 24 }; // Gap between buttons
    const stackStyles: IStackStyles = {
      root: {
        padding: '40px 60px', // Increased padding for more white space
        maxWidth: '600px', // Set a max-width for the modal content
        margin: '0 auto', // Center the modal content
        textAlign: 'center', // Center align all content
      }
    };

    const buttonStyles = {
      root: {
        width: '200px', // Fixed width for buttons
        height: '50px', // Fixed height for buttons
        fontSize: '16px', // Slightly larger font for buttons
        fontWeight: FontWeights.semibold, // Bold font for buttons
      },
      label: {
        fontWeight: FontWeights.semibold, // Ensure label is bold
      }
    };

    const titleStyles = {
      root: {
        fontSize: '36px', // Larger font size for the title
        fontWeight: FontWeights.bold, // Bold title
        marginBottom: '20px', // Add some space below the title
        color: '#323130' // Darker color for title
      }
    };

    const textStyles = {
      root: {
        fontSize: '16px', // Standard font size for body text
        lineHeight: '24px', // Improve readability
        color: '#323130', // Darker color for body text
        marginBottom: '10px' // Space between paragraphs
      }
    };


    return React.createElement(Modal, {
      isOpen: this.state.isOpen,
      isBlocking: true,
      onDismiss: this._onDecline,
      containerClassName: 'privacyModalContainer' // Add a class for potential custom CSS if needed
    },
      React.createElement(Stack, { tokens: stackTokens, styles: stackStyles, horizontalAlign: 'center' }, // Center content horizontally
        React.createElement(Text, { styles: titleStyles }, 'Privacy Notice'), // Applied custom title styles
        React.createElement(Stack, { tokens: contentStackTokens },
          React.createElement(Text, { styles: textStyles },
            `Our site collects and stores information about you, your preferences and behavior, and your device to analyze website traffic, personalize content and ads, and provide social media features.`
          ),
          React.createElement(Text, { styles: textStyles },
            `Because we care about your privacy, you can decide whether to allow or reject the use of this technology.`
          )
        ),
        React.createElement(Stack, { horizontal: true, tokens: buttonStackTokens, horizontalAlign: 'center' }, // Center buttons horizontally
          React.createElement(PrimaryButton, { text: 'ACCEPT ALL', onClick: this._onAccept, styles: buttonStyles }), // Applied custom button styles
          React.createElement(DefaultButton, { text: 'DECLINE ALL', onClick: this._onDecline, styles: buttonStyles }) // Applied custom button styles
        )
      )
    );
  }
}