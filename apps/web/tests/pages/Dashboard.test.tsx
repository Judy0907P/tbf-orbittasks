import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from '../../src/pages/Dashboard';

function mockTasks(payload: unknown) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => payload,
  });
}

describe('Dashboard page', () => {
  it('shows a loading spinner first', () => {
    mockTasks([]);
    render(<Dashboard projectId={1} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders tasks once loaded', async () => {
    mockTasks([
      { id: 1, title: 'A', description: '', status: 'todo', assigneeId: null, projectId: 1, dueDate: null },
      { id: 2, title: 'B', description: '', status: 'done', assigneeId: null, projectId: 1, dueDate: null },
    ]);
    render(<Dashboard projectId={1} />);
    await waitFor(() => {
      expect(screen.getByTestId('task-list')).toBeInTheDocument();
    });
    expect(screen.getAllByTestId('task-card')).toHaveLength(2);
  });

  it('renders stats', async () => {
    mockTasks([
      { id: 1, title: 'A', description: '', status: 'todo', assigneeId: null, projectId: 1, dueDate: null },
      { id: 2, title: 'B', description: '', status: 'done', assigneeId: null, projectId: 1, dueDate: null },
      { id: 3, title: 'C', description: '', status: 'doing', assigneeId: null, projectId: 1, dueDate: null },
    ]);
    render(<Dashboard projectId={1} />);
    await waitFor(() => expect(screen.getByTestId('stat-total')).toBeInTheDocument());
    expect(screen.getByTestId('stat-open')).toHaveTextContent('2');
    expect(screen.getByTestId('stat-completed')).toHaveTextContent('1');
  });

  it('renders an error message on failed load', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('network down'));
    render(<Dashboard projectId={1} />);
    await waitFor(() => expect(screen.getByTestId('dashboard-error')).toBeInTheDocument());
  });

  // Was flaky: fetch resolves after a random 0-30ms delay; the old test slept
  // a fixed 15ms then asserted. Fix: wait for the list instead of guessing.
  it('shows the task list shortly after load', async () => {
    globalThis.fetch = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                status: 200,
                json: async () => [
                  { id: 1, title: 'A', description: '', status: 'todo', assigneeId: null, projectId: 1, dueDate: null },
                ],
              }),
            Math.random() * 30,
          ),
        ),
    );
    render(<Dashboard projectId={1} />);
    await waitFor(() => expect(screen.getByTestId('task-list')).toBeInTheDocument());
  });
});
