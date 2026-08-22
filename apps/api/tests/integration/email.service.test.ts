jest.mock('../../src/clients/email.client');

import { EmailService } from '../../src/services/email.service';

describe('email service', () => {
  const service = new EmailService();

  it('sends a welcome email and returns a message id', async () => {
    const id = await service.welcome('alice@example.com', 'Alice');
    expect(id).toMatch(/^msg_/);
  });

  it('sends a password reset email', async () => {
    const id = await service.passwordReset('bob@example.com', 'https://reset.example.com/abc');
    expect(id).toMatch(/^msg_/);
  });

  it('sends a digest email', async () => {
    const id = await service.digest('carol@example.com', {
      taskCount: 7,
      completedCount: 3,
    });
    expect(id).toMatch(/^msg_/);
  });

  it('bulk-invites multiple recipients', async () => {
    const accepted = await service.bulkInvite(
      ['a@example.com', 'b@example.com', 'c@example.com'],
      'Alice',
    );
    expect(accepted).toBe(3);
  });

  it('returns 0 when bulk-inviting empty list', async () => {
    const accepted = await service.bulkInvite([], 'Alice');
    expect(accepted).toBe(0);
  });
});
