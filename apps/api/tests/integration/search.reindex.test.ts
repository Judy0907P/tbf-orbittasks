jest.mock('../../src/clients/search.client');

import { SearchService } from '../../src/services/search.service';

// Search workloads. SearchClient is manually mocked so queries stay in-process.
describe('search reindex + queries', () => {
  it('answers 160 task search queries', async () => {
    const service = new SearchService();
    for (let i = 0; i < 160; i++) {
      const ids = await service.searchTasks(`launch ${i}`);
      expect(Array.isArray(ids)).toBe(true);
    }
  }, 60_000);

  it('answers 150 dashboard search queries', async () => {
    const service = new SearchService();
    for (let i = 0; i < 150; i++) {
      const ids = await service.searchTasks(`sprint ${i}`);
      expect(Array.isArray(ids)).toBe(true);
    }
  }, 60_000);

  it('answers 150 saved-search queries', async () => {
    const service = new SearchService();
    for (let i = 0; i < 150; i++) {
      const ids = await service.searchTasks(`backlog ${i}`);
      expect(Array.isArray(ids)).toBe(true);
    }
  }, 60_000);
});
