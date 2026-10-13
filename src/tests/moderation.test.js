import { describe, it, expect } from 'vitest';
import { filterVisiblePosts, replyKey, postKey } from '../utils/moderation';

const posts = [
  { id: 'p1', authorId: 'a', replies: [{ authorId: 'b', createdAt: 't1' }, { authorId: 'c', createdAt: 't2' }] },
  { id: 'p2', authorId: 'b', replies: [] },
  { id: 'p3', authorId: 'c' },
];

describe('filterVisiblePosts', () => {
  it('returns everything when nothing is blocked or hidden', () => {
    expect(filterVisiblePosts(posts)).toHaveLength(3);
  });

  it('drops posts from blocked authors and their replies elsewhere', () => {
    const out = filterVisiblePosts(posts, ['b']);
    expect(out.map((p) => p.id)).toEqual(['p1', 'p3']);
    expect(out[0].replies.map((r) => r.authorId)).toEqual(['c']);
  });

  it('drops reported posts and replies', () => {
    const out = filterVisiblePosts(posts, [], [postKey('p3'), replyKey('p1', posts[0].replies[1])]);
    expect(out.map((p) => p.id)).toEqual(['p1', 'p2']);
    expect(out[0].replies.map((r) => r.authorId)).toEqual(['b']);
  });

  it('handles posts without replies and null input', () => {
    expect(filterVisiblePosts(null)).toEqual([]);
    expect(filterVisiblePosts(posts)[2].replies).toEqual([]);
  });

  it('replyKey has no slashes', () => {
    expect(replyKey('p/1', { authorId: 'a b', createdAt: '2026-01-01T00:00:00Z' })).not.toMatch(/[/\s]/);
  });
});
