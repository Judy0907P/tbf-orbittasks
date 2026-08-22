jest.mock('../../src/clients/search.client');

import { SearchService } from '../../src/services/search.service';
import { db } from '../../src/db/client';

describe('search service', () => {
  let service: SearchService;

  beforeEach(() => {
    db.reset();
    service = new SearchService();
  });

  it('indexes tasks and returns count', async () => {
    db.insert('tasks', { id: 1, title: 'a' });
    db.insert('tasks', { id: 2, title: 'b' });
    const count = await service.reindexTasks();
    expect(count).toBe(2);
  });

  it('indexes projects and returns count', async () => {
    db.insert('projects', { id: 1, name: 'A' });
    const count = await service.reindexProjects();
    expect(count).toBe(1);
  });

  it('returns object IDs for matching queries', async () => {
    const ids = await service.searchTasks('launch');
    expect(Array.isArray(ids)).toBe(true);
    expect(ids.length).toBeGreaterThan(0);
  });

  it('returns empty array for empty query', async () => {
    const ids = await service.searchTasks('');
    expect(ids).toEqual([]);
  });

  it('handles indexing empty collections', async () => {
    const count = await service.reindexTasks();
    expect(count).toBe(0);
  });
});
