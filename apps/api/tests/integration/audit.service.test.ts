jest.mock('../../src/clients/audit.client');

import { AuditService } from '../../src/services/audit.service';

describe('audit service', () => {
  it('buffers events until threshold', () => {
    const a = new AuditService(undefined, 100);
    a.record({ type: 'task.created', actorId: 1, resource: 'task', resourceId: 1 });
    expect(a.size()).toBe(1);
  });

  it('flushes buffered events on demand', async () => {
    const a = new AuditService(undefined, 100);
    a.record({ type: 'task.created', actorId: 1, resource: 'task', resourceId: 1 });
    a.record({ type: 'task.created', actorId: 1, resource: 'task', resourceId: 2 });
    const sent = await a.flush();
    expect(sent).toBe(2);
    expect(a.size()).toBe(0);
  });

  it('returns 0 when flushing empty buffer', async () => {
    const a = new AuditService();
    expect(await a.flush()).toBe(0);
  });

  it('auto-flushes at threshold', async () => {
    const a = new AuditService(undefined, 2);
    a.record({ type: 'task.created', actorId: 1, resource: 'task', resourceId: 1 });
    a.record({ type: 'task.created', actorId: 1, resource: 'task', resourceId: 2 });
    // give the fire-and-forget a moment
    await new Promise((r) => setImmediate(r));
    expect(a.size()).toBe(0);
  });

  it('handles a single flush of many events', async () => {
    const a = new AuditService(undefined, 1000);
    for (let i = 0; i < 25; i++) {
      a.record({ type: 'task.created', actorId: 1, resource: 'task', resourceId: i });
    }
    expect(await a.flush()).toBe(25);
  });
});
