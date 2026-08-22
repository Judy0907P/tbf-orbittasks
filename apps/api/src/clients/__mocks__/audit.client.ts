export interface AuditEvent {
  type: string;
  actorId: number;
  resource: string;
  resourceId: string | number;
  at: number;
  meta?: Record<string, unknown>;
}

export class AuditClient {
  async log(events: AuditEvent[]): Promise<{ accepted: boolean; count: number }> {
    return { accepted: true, count: events.length };
  }
}
