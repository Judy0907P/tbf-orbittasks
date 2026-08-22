jest.mock('../../src/clients/notifications.client');

import { NotificationsClient } from '../../src/clients/notifications.client';

// Notification blasts. NotificationsClient is manually mocked so posts stay in-process.
describe('notification blast', () => {
  it('posts 160 task-assignment notifications', async () => {
    const client = new NotificationsClient();
    for (let i = 0; i < 160; i++) {
      const result = await client.send('#tasks', `You were assigned task ${i}`);
      expect(result.ok).toBe(true);
    }
  }, 60_000);

  it('posts 150 daily-digest pings', async () => {
    const client = new NotificationsClient();
    for (let i = 0; i < 150; i++) {
      const result = await client.send('#digests', `Daily digest for user ${i}`);
      expect(result.ok).toBe(true);
    }
  }, 60_000);

  it('posts 150 mention alerts', async () => {
    const client = new NotificationsClient();
    for (let i = 0; i < 150; i++) {
      const result = await client.send('#mentions', `You were mentioned in task ${i}`);
      expect(result.ok).toBe(true);
    }
  }, 60_000);
});
