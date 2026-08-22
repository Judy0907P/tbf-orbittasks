export interface DeliveryResult {
  delivered: boolean;
  url: string;
  attempts: number;
}

export class WebhooksClient {
  async deliver(url: string, _event: string, _payload: unknown): Promise<DeliveryResult> {
    return {
      delivered: true,
      url,
      attempts: 1,
    };
  }
}
