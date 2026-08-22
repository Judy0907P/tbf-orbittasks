jest.mock('../../src/clients/billing.client');

import { BillingService } from '../../src/services/billing.service';
import { db } from '../../src/db/client';

// Month-end billing rollups. BillingClient is manually mocked so enroll/charge
// stay in-process instead of round-tripping the mock HTTP server.
describe('billing month-end rollup', () => {
  beforeEach(() => {
    db.reset();
  });

  const cohorts = [
    { month: 'January', size: 48 },
    { month: 'February', size: 48 },
    { month: 'March', size: 48 },
    { month: 'April', size: 48 },
  ];

  for (const { month, size } of cohorts) {
    it(`rolls up ${month} billing across ${size} customers`, async () => {
      const billing = new BillingService();

      for (let i = 0; i < size; i++) {
        await billing.enrollUser(i + 1, `user${i}@example.com`);
      }

      let succeeded = 0;
      for (let i = 0; i < size; i++) {
        const charge = await billing.charge(i + 1, 1999);
        if (charge.status === 'succeeded') succeeded++;
      }
      expect(succeeded).toBe(size);
    }, 60_000);
  }
});
