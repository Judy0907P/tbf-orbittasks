export interface NotificationResult {
  ok: boolean;
  channel: string;
  ts: string;
}

export class NotificationsClient {
  async send(channel: string, _text: string): Promise<NotificationResult> {
    return {
      ok: true,
      channel,
      ts: String(Date.now() / 1000),
    };
  }
}
