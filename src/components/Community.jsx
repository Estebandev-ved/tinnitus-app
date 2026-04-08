import React, { useState, useEffect } from 'react';
import { X, Send, Heart, MessageCircle, User, Plus, Trophy, MessageSquare, Map as MapIcon } from 'lucide-react';
import { FirestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import GlobalMap from './GlobalMap';
import './Community.css';
import communityIllustration from '../assets/illustrations/community.png';

const CATEGORIES = [
    { key: 'all', label: 'Todos' },
    { key: 'tips', label: '💡 Tips' },
    { key: 'experiencias', label: '📖 Experiencias' },
    { key: 'preguntas', label: '❓ Preguntas' },
];

const Community = ({ onClose }) => {
    const { currentUser } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('forum'); // 'forum', 'map', 'leaders'
    const [activeCategory, setActiveCategory] = useState('all');
    const [showCompose, setShowCompose] = useState(false);
    const [newPost, setNewPost] = useState({ text: '', category: 'tips' });
    const [expandedPost, setExpandedPost] = useState(null);
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            const data = await FirestoreService.getCommunityPosts();
            setPosts(data);
        } catch (e) {
            console.error('Error loading posts:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async () => {
        if (!newPost.text.trim() || !currentUser) return;
        try {
            await FirestoreService.createCommunityPost({
                text: newPost.text,
                category: newPost.category,
                authorId: currentUser.uid,
                authorName: 'Anónimo',
                likes: 0,
                likedBy: [],
                replies: [],
            });
            setNewPost({ text: '', category: 'tips' });
            setShowCompose(false);
            loadPosts();
        } catch (e) {
            console.error('Error creating post:', e);
        }
    };

    const handleLike = async (postId) => {
        if (!currentUser) return;
        try {
            await FirestoreService.toggleLike(postId, currentUser.uid);
            loadPosts();
        } catch (e) {
            console.error('Error liking:', e);
        }
    };

    const handleReply = async (postId) => {
        if (!replyText.trim() || !currentUser) return;
        try {
            await FirestoreService.addReply(postId, {
                text: replyText,
                authorId: currentUser.uid,
                authorName: 'Anónimo',
            });
            setReplyText('');
            loadPosts();
        } catch (e) {
            console.error('Error replying:', e);
        }
    };

    const filteredPosts = activeCategory === 'all'
        ? posts
        : posts.filter(p => p.category === activeCategory);

    const getCategoryEmoji = (cat) => {
        const map = { tips: '💡', experiencias: '📖', preguntas: '❓' };
        return map[cat] || '💬';
    };

    const timeAgo = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const diff = Math.floor((Date.now() - date.getTime()) / 1000);
        if (diff < 60) return 'ahora';
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        return `${Math.floor(diff / 86400)}d`;
    };

    return (
        <div className="community-overlay animate-fade">
            <div className="community-modal">
                <header className="community-header">
                    <h3>Comunidad</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </header>

                <img src={communityIllustration} alt="" className="feature-illustration" />

                {/* Tabs */}
                <div className="community-tabs" style={{ display: 'flex', gap: 8, padding: '0 24px', marginBottom: 16 }}>
                    <button className={`cat-btn ${activeTab === 'forum' ? 'active' : ''}`} onClick={() => setActiveTab('forum')}><MessageSquare size={16} /> Foro</button>
                    <button className={`cat-btn ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}><MapIcon size={16} /> Mapa Global</button>
                    <button className={`cat-btn ${activeTab === 'leaders' ? 'active' : ''}`} onClick={() => setActiveTab('leaders')}><Trophy size={16} /> Líderes</button>
                </div>

                {activeTab === 'forum' && (
                    <>
                        {/* Categories */}
                        <div className="community-categories">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.key}
                                    className={`cat-btn ${activeCategory === cat.key ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat.key)}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Posts */}
                        <div className="community-posts">
                            {loading ? (
                                <p className="community-empty">Cargando...</p>
                            ) : filteredPosts.length === 0 ? (
                                <p className="community-empty">No hay posts aún. ¡Sé el primero!</p>
                            ) : (
                                filteredPosts.map(post => (
                                    <div key={post.id} className="post-card">
                                        <div className="post-top">
                                            <div className="post-author">
                                                <div className="post-avatar"><User size={16} /></div>
                                                <span>{post.authorName || 'Anónimo'}</span>
                                                <span className="post-time">{timeAgo(post.createdAt)}</span>
                                            </div>
                                            <span className="post-cat">{getCategoryEmoji(post.category)}</span>
                                        </div>
                                        <p className="post-text">{post.text}</p>
                                        <div className="post-actions">
                                            <button
                                                className={`post-action-btn ${post.likedBy?.includes(currentUser?.uid) ? 'liked' : ''}`}
                                                onClick={() => handleLike(post.id)}
                                            >
                                                <Heart size={16} fill={post.likedBy?.includes(currentUser?.uid) ? '#FF3B30' : 'none'} /> {post.likes || 0}
                                            </button>
                                            <button className="post-action-btn" onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}>
                                                <MessageCircle size={16} /> {post.replies?.length || 0}
                                            </button>
                                        </div>

                                        {/* Replies */}
                                        {expandedPost === post.id && (
                                            <div className="post-replies animate-fade">
                                                {(post.replies || []).map((reply, i) => (
                                                    <div key={i} className="reply-item">
                                                        <strong>{reply.authorName || 'Anónimo'}</strong>
                                                        <p>{reply.text}</p>
                                                    </div>
                                                ))}
                                                <div className="reply-input-row">
                                                    <input
                                                        type="text"
                                                        placeholder="Responder..."
                                                        value={replyText}
                                                        onChange={e => setReplyText(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && handleReply(post.id)}
                                                    />
                                                    <button onClick={() => handleReply(post.id)}>
                                                        <Send size={16} color="#007AFF" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'map' && <GlobalMap />}

                {activeTab === 'leaders' && (
                    <div className="leaderboard-container">
                        <div className="leader-item top-1">
                            <div className="rank">1</div>
                            <div className="leader-info">
                                <strong>Alex (Reino Unido)</strong>
                                <span>100 días consecutivos escuchando</span>
                            </div>
                            <Trophy color="#FFD700" size={24} />
                        </div>
                        <div className="leader-item top-2">
                            <div className="rank">2</div>
                            <div className="leader-info">
                                <strong>Luis (España)</strong>
                                <span>45 días consecutivos</span>
                            </div>
                            <Trophy color="#C0C0C0" size={24} />
                        </div>
                        <div className="leader-item top-3">
                            <div className="rank">3</div>
                            <div className="leader-info">
                                <strong>Maria (Colombia)</strong>
                                <span>23 días consecutivos</span>
                            </div>
                            <Trophy color="#CD7F32" size={24} />
                        </div>
                        <div className="leader-item current-user">
                            <div className="rank">#248</div>
                            <div className="leader-info">
                                <strong>Tú</strong>
                                <span>¡Sigue habituándote a diario!</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Compose FAB */}
                {!showCompose && activeTab === 'forum' && (
                    <button className="compose-fab" onClick={() => setShowCompose(true)}>
                        <Plus size={24} />
                    </button>
                )}

                {/* Compose Modal */}
                {showCompose && (
                    <div className="compose-sheet animate-fade">
                        <h4>Nuevo Post</h4>
                        <div className="compose-cats">
                            {CATEGORIES.filter(c => c.key !== 'all').map(cat => (
                                <button
                                    key={cat.key}
                                    className={`cat-btn ${newPost.category === cat.key ? 'active' : ''}`}
                                    onClick={() => setNewPost(p => ({ ...p, category: cat.key }))}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                        <textarea
                            placeholder="Comparte con la comunidad... (anónimo)"
                            value={newPost.text}
                            onChange={e => setNewPost(p => ({ ...p, text: e.target.value }))}
                            rows={4}
                        />
                        <div className="compose-actions">
                            <button className="btn btn-ghost" onClick={() => setShowCompose(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleCreatePost} disabled={!newPost.text.trim()}>
                                Publicar <Send size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community;
