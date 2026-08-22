export interface Customer {
  id: string;
  email: string;
  created: number;
  subscriptionStatus?: 'active' | 'past_due' | 'cancelled';
}

export interface Charge {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
}

let customerSeq = 0;
let chargeSeq = 0;

export class BillingClient {
  async createCustomer(email: string): Promise<Customer> {
    customerSeq += 1;
    return {
      id: `cus_mock_${customerSeq}`,
      email,
      created: Date.now(),
      subscriptionStatus: 'active',
    };
  }

  async getCustomer(id: string): Promise<Customer> {
    return {
      id,
      email: 'mock@example.com',
      created: Date.now(),
      subscriptionStatus: 'active',
    };
  }

  async charge(customerId: string, amountCents: number): Promise<Charge> {
    chargeSeq += 1;
    return {
      id: `ch_mock_${chargeSeq}`,
      amount: amountCents,
      currency: 'usd',
      status: 'succeeded',
    };
  }
}
