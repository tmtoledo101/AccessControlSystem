import * as React from 'react';
import PrivacyModal from './components/PrivacyModal';

export interface IPrivacyGateProps {
  context: any;
  siteUrl?: string;
  refNo?: string;
  children: React.ReactNode;
}

const PrivacyGate: React.FC<IPrivacyGateProps> = (props) => {
  // Always locked on mount (open page, refresh, etc.)
  const [accepted, setAccepted] = React.useState<boolean>(false);

  if (!accepted) {
    return (
      <PrivacyModal
        context={props.context}
        refNo={props.refNo || ''}
        onAccept={() => setAccepted(true)}
        onDecline={() => window.open(props.siteUrl || props.context.pageContext.web.absoluteUrl, '_self')}
      />
    );
  }

  return <React.Fragment>{props.children}</React.Fragment>;
};

export default PrivacyGate;