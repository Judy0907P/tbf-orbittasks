jest.mock('../../src/clients/email.client');

import { EmailService } from '../../src/services/email.service';

// Bulk email campaigns. EmailClient is manually mocked so sends stay in-process.
describe('email campaigns', () => {
  const recipients = (n: number) => Array.from({ length: n }, (_, i) => `user${i}@example.com`);

  it('sends the weekly digest to 160 users', async () => {
    const service = new EmailService();
    let sent = 0;
    for (const to of recipients(160)) {
      const id = await service.digest(to, { taskCount: 5, completedCount: 2 });
      expect(id).toBeTruthy();
      sent++;
    }
    expect(sent).toBe(160);
  }, 60_000);

  it('runs a 160-seat onboarding invite', async () => {
    const accepted = await new EmailService().bulkInvite(recipients(160), 'Demo User');
    expect(accepted).toBe(160);
  }, 60_000);

  it('sends 150 password-reset emails', async () => {
    const service = new EmailService();
    let sent = 0;
    for (const to of recipients(150)) {
      const id = await service.passwordReset(to, `https://orbittasks.local/reset/${to}`);
      expect(id).toBeTruthy();
      sent++;
    }
    expect(sent).toBe(150);
  }, 60_000);
});
