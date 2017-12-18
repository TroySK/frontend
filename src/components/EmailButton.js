import Component from 'inferno-component';
import EmailModal from './EmailModal';
import './EmailButton.css';

const supportsLongUrls = (function() {
  var IEMobile = /IEMobile/i.test(navigator.userAgent);

  // TODO: check needs to be more robust
  // UCBrowser etc?
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini/i.test(
      navigator.userAgent
    ) && !IEMobile
  );
})();

const supportsMailto = (function() {
  var IEMobile = /IEMobile/i.test(navigator.userAgent);

  // TODO: check needs to be more robust
  // UCBrowser etc?
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini/i.test(
      navigator.userAgent
    ) && !IEMobile
  );
})();

class EmailButton extends Component {
  state = {};
  getMailUrl(type, includeBody) {
    let base, params;
    let {subject, body, name, to, cc, bcc} = this.props;

    // Windows chokes on long URLs, so we avoid them
    if(!includeBody) body = '';

    // Yahoo cannot handle the "Name <email>" format
    const addrOnly = ['yahoo'].includes(type);

    // Encode recipient lists
    [to, cc, bcc] = [to, cc, bcc].map(emails => {
      if (!Array.isArray(emails)) emails = emails ? [emails] : [];
      if (!addrOnly && name) emails = emails.map(email => `${name}<${email}>`);
      return encodeURIComponent(emails.join(','));
    });

    // Encode the subject and body
    [subject, body] = [subject, body].map(encodeURIComponent);

    switch (type) {
      case 'gmail':
        base = `https://mail.google.com/mail/u/0/`;
        params = [
          `view=cm&fs=1&tf=1&source=mailto`,
          `to=${to}`,
          cc && `cc=${cc}`,
          bcc && `bcc=${bcc}`,
          subject && `su=${subject}`,
          body && `body=${body}`
        ];
        break;
      case 'yahoo':
        base = `http://compose.mail.yahoo.com/`;
        params = [
          `To=${to}`,
          cc && `Cc=${cc}`,
          bcc && `Bcc=${bcc}`,
          subject && `Subject=${subject}`,
          body && `Body=${body}`
        ];
        break;
      default:
        base = `mailto:${to}`;
        params = [
          cc && `cc=${cc}`,
          bcc && `bcc=${bcc}`,
          subject && `subject=${subject}`,
          body && `body=${body}`
        ];
        break;
    }

    return `${base}?${params.filter(p => p).join('&')}`;
  }

  copyBody = event => {
    this.setState({ showModal: true });
    event.preventDefault();
  }

  render() {
    if (supportsMailto) {
      const url = this.getMailUrl('mailto', supportsLongUrls);
      return (
        <div className="EmailButton-group">
          <a // eslint-disable-line jsx-a11y/anchor-is-valid
            className="EmailButton-view"
            onClick={() => this.setState({ showModal: true })}
          >View Petition</a>
          <a className="EmailButton" href={url} target="_blank">Send Email</a>
        </div>
      );
    } else {
      const gmail = this.getMailUrl('gmail', supportsLongUrls);
      const yahoo = this.getMailUrl('yahoo', supportsLongUrls);
      const other = this.getMailUrl('mailto', supportsLongUrls);
      const showModal = !!this.state.showModal;

      return (
        <div className="EmailButton-group">
          <a // eslint-disable-line jsx-a11y/anchor-is-valid
            className="EmailButton-view"
            onClick={() => this.setState({ showModal: true })}
          >View Petition</a>
          <a className="EmailButton btn-gmail" href={gmail} target="_blank"
            onClick={supportsLongUrls || this.copyBody}
          >Gmail</a>
          <a className="EmailButton btn-yahoo" href={yahoo} target="_blank"
            onClick={supportsLongUrls || this.copyBody}
          >Yahoo!</a>
          <a className="EmailButton btn-default" href={other} target="_blank"
            onClick={supportsLongUrls || this.copyBody}
          >Other</a>
          <EmailModal
            show={showModal}
            {...this.props}
            onClose={() => this.setState({ showModal: false })}
          ></EmailModal>
        </div>
      );
    }
  }
}

export default EmailButton;
