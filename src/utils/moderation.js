// CMP-03 · pure helpers for community moderation (hide blocked / reported content).

export const REPORT_REASONS = ['spam', 'harassment', 'harmful', 'misinformation', 'other'];

// Stable key for an embedded reply (replies have no id). Safe for use as a Firestore doc id.
export const replyKey = (postId, reply) => {
  const raw = `${postId}__${reply?.authorId || 'x'}__${reply?.createdAt || ''}`;
  return raw.replace(/[/\s]/g, '_').slice(0, 300);
};

export const postKey = (postId) => `post_${postId}`;

// Returns posts visible to the viewer: drops blocked authors and reported posts, and filters replies.
// blockedIds / hiddenKeys: Set or array.
export const filterVisiblePosts = (posts, blockedIds = [], hiddenKeys = []) => {
  const blocked = new Set(blockedIds);
  const hidden = new Set(hiddenKeys);
  return (posts || [])
    .filter((p) => !blocked.has(p.authorId) && !hidden.has(postKey(p.id)))
    .map((p) => ({
      ...p,
      replies: (p.replies || []).filter(
        (r) => !blocked.has(r.authorId) && !hidden.has(replyKey(p.id, r)),
      ),
    }));
};
