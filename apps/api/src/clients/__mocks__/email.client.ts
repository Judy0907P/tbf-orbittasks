export interface EmailReceipt {
  messageId: string;
  to: string;
  accepted: boolean;
}

export interface SendEmail {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

let messageSeq = 0;

export class EmailClient {
  async send(email: SendEmail): Promise<EmailReceipt> {
    messageSeq += 1;
    return {
      messageId: `msg_mock_${messageSeq}`,
      to: email.to,
      accepted: true,
    };
  }

  async sendBatch(emails: SendEmail[]): Promise<EmailReceipt[]> {
    const out: EmailReceipt[] = [];
    for (const e of emails) {
      out.push(await this.send(e));
    }
    return out;
  }
}
