jest.mock('../../src/clients/webhooks.client');

import { WebhooksService } from '../../src/services/webhooks.service';
import { db } from '../../src/db/client';

describe('webhooks service', () => {
  let service: WebhooksService;

  beforeEach(() => {
    db.reset();
    service = new WebhooksService();
  });

  it('subscribes to events', () => {
    const sub = service.subscribe(1, 'https://example.com/hook', ['task.completed']);
    expect(sub.workspaceId).toBe(1);
    expect(sub.events).toContain('task.completed');
  });

  it('lists active subscriptions only', () => {
    service.subscribe(1, 'https://a.example/hook', ['task.completed']);
    const second = service.subscribe(1, 'https://b.example/hook', ['task.completed']);
    service.unsubscribe(second.id);
    const list = service.list(1);
    expect(list).toHaveLength(1);
  });

  it('dispatches matching events to subscribed urls', async () => {
    service.subscribe(1, 'https://example.com/hook', ['task.completed']);
    service.subscribe(1, 'https://other.example/hook', ['task.completed']);
    const delivered = await service.dispatch(1, 'task.completed', { taskId: 42 });
    expect(delivered).toBe(2);
  });

  it('skips subscriptions not listening to the event', async () => {
    service.subscribe(1, 'https://example.com/hook', ['task.assigned']);
    const delivered = await service.dispatch(1, 'task.completed', {});
    expect(delivered).toBe(0);
  });

  it('returns false when unsubscribing a missing sub', () => {
    expect(service.unsubscribe(999)).toBe(false);
  });
});
