import { Avatar } from './Avatar';
import { formatRelativeDays } from '../lib/format';

export interface Comment {
  id: number;
  authorName: string;
  body: string;
  createdAt: string;
}

// Optional `now` makes relative timestamps deterministic in tests.
// Defaults to the real clock in the app.
export function CommentList({ comments, now }: { comments: Comment[]; now?: Date }) {
  if (comments.length === 0) {
    return <p style={{ color: '#6B7280' }}>No comments yet.</p>;
  }
  return (
    <ul data-testid="comment-list" style={{ listStyle: 'none', padding: 0 }}>
      {comments.map((c) => (
        <li key={c.id} style={{ display: 'flex', gap: 12, padding: '8px 0' }}>
          <Avatar name={c.authorName} size={32} />
          <div>
            <strong>{c.authorName}</strong>{' '}
            <span style={{ color: '#6B7280', fontSize: 12 }}>
              {formatRelativeDays(c.createdAt, now)}
            </span>
            <p style={{ margin: '4px 0 0 0' }}>{c.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
