import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CommentList } from '../../src/components/CommentList';

describe('CommentList', () => {
  it('renders empty state', () => {
    render(<CommentList comments={[]} />);
    expect(screen.getByText('No comments yet.')).toBeInTheDocument();
  });

  it('renders each comment', () => {
    const comments = [
      { id: 1, authorName: 'Alice', body: 'Looks good', createdAt: new Date().toISOString() },
      { id: 2, authorName: 'Bob', body: 'Ship it', createdAt: new Date().toISOString() },
    ];
    render(<CommentList comments={comments} />);
    expect(screen.getAllByText(/Looks good|Ship it/)).toHaveLength(2);
  });

  // Was flaky: dated a comment ~half a day back and read the real clock, so
  // rounding flipped between "today" and "yesterday". Fix: inject a fixed `now`.
  it('renders a relative timestamp deterministically', () => {
    const now = new Date('2026-01-15T12:00:00.000Z');
    const createdAt = new Date(now.getTime() - 11 * 60 * 60 * 1000); // 11h earlier, same day
    render(
      <CommentList
        now={now}
        comments={[
          { id: 1, authorName: 'Alice', body: 'Recent comment', createdAt: createdAt.toISOString() },
        ]}
      />,
    );
    expect(screen.getByText('today')).toBeInTheDocument();
  });
});
