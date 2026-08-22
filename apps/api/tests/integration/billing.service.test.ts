jest.mock('../../src/clients/billing.client');

import { BillingService } from '../../src/services/billing.service';
import { db } from '../../src/db/client';

describe('billing service', () => {
  let service: BillingService;

  beforeEach(() => {
    db.reset();
    service = new BillingService();
  });

  it('enrolls a user and creates a customer record', async () => {
    const record = await service.enrollUser(1, 'alice@example.com');
    expect(record.userId).toBe(1);
    expect(record.customerId).toMatch(/^cus_/);
    expect(record.status).toBe('active');
  });

  it('refreshes a customer status from the provider', async () => {
    const record = await service.enrollUser(1, 'alice@example.com');
    const fresh = await service.refresh(1);
    expect(fresh.id).toBe(record.customerId);
  });

  it('rejects refresh for unenrolled user', async () => {
    await expect(service.refresh(99)).rejects.toThrow('not enrolled');
  });

  it('charges an enrolled user', async () => {
    await service.enrollUser(1, 'alice@example.com');
    const charge = await service.charge(1, 1999);
    expect(charge.status).toBe('succeeded');
  });

  it('rejects charge for unenrolled user', async () => {
    await expect(service.charge(99, 100)).rejects.toThrow('not enrolled');
  });

  it('calculates monthly total from succeeded charges only', () => {
    const total = service.calculateMonthlyTotal([
      { id: 'a', amount: 1000, currency: 'usd', status: 'succeeded' },
      { id: 'b', amount: 500, currency: 'usd', status: 'failed' },
      { id: 'c', amount: 2000, currency: 'usd', status: 'succeeded' },
    ]);
    expect(total).toBe(3000);
  });
});
