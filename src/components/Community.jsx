import React, { useState, useEffect } from 'react';
import { X, Send, Heart, MessageCircle, User, Plus, Trophy, MessageSquare, Map as MapIcon, Globe2, Sparkles } from 'lucide-react';
import { FirestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import GlobalMap from './GlobalMap';
import './Community.css';

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
            setPosts(data || []);
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
        <div className="comm-full-wrapper animate-fade">
            <div className="comm-full-container">
                <header className="comm-header">
                    <h2><Globe2 size={24} color="#30B0C7"/> Red Global de TinnitOff</h2>
                    <button className="comm-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </header>

                <div className="comm-tabs-nav">
                    <button className={`comm-tab-btn ${activeTab === 'forum' ? 'active' : ''}`} onClick={() => setActiveTab('forum')}>
                        <MessageSquare size={18} /> Foro de Apoyo
                    </button>
                    <button className={`comm-tab-btn ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>
                        <MapIcon size={18} /> Mapa Mundial
                    </button>
                    <button className={`comm-tab-btn ${activeTab === 'leaders' ? 'active' : ''}`} onClick={() => setActiveTab('leaders')}>
                        <Trophy size={18} /> Líderes de Resiliencia
                    </button>
                </div>

                <div className="comm-content">
                    {activeTab === 'forum' && (
                        <>
                            <div className="comm-categories">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.key}
                                        className={`cat-pill ${activeCategory === cat.key ? 'active' : ''}`}
                                        onClick={() => setActiveCategory(cat.key)}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            <div className="comm-posts-area">
                                {loading ? (
                                    <div className="comm-empty">Cargando...</div>
                                ) : filteredPosts.length === 0 ? (
                                    <div className="comm-empty">No hay posts en esta categoría. ¡Sé el primero!</div>
                                ) : (
                                    filteredPosts.map(post => (
                                        <div key={post.id} className="comm-post-card glass-card">
                                            <div className="post-header-top">
                                                <div className="author-tag">
                                                    <div className="author-avatar"><User size={14} /></div>
                                                    <span>{post.authorName || 'Anónimo'}</span>
                                                    <span className="time-stamp">• {timeAgo(post.createdAt)}</span>
                                                </div>
                                                <span className="cat-badge">{getCategoryEmoji(post.category)}</span>
                                            </div>
                                            <p className="post-content-text">{post.text}</p>
                                            
                                            <div className="post-actions-row">
                                                <button
                                                    className={`action-btn-p ${post.likedBy?.includes(currentUser?.uid) ? 'liked' : ''}`}
                                                    onClick={() => handleLike(post.id)}
                                                >
                                                    <Heart size={16} fill={post.likedBy?.includes(currentUser?.uid) ? '#FF2D55' : 'none'} color={post.likedBy?.includes(currentUser?.uid) ? '#FF2D55' : 'currentColor'}/> 
                                                    {post.likes || 0}
                                                </button>
                                                <button className="action-btn-p" onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}>
                                                    <MessageCircle size={16} /> {post.replies?.length || 0} Comentarios
                                                </button>
                                            </div>

                                            {expandedPost === post.id && (
                                                <div className="replies-section animate-fade">
                                                    {(post.replies || []).map((reply, i) => (
                                                        <div key={i} className="reply-bubble">
                                                            <span className="reply-author">{reply.authorName || 'Anónimo'}</span>
                                                            <p>{reply.text}</p>
                                                        </div>
                                                    ))}
                                                    <div className="reply-input-wrapper">
                                                        <input
                                                            type="text"
                                                            className="premium-input"
                                                            placeholder="Escribe un comentario alentador..."
                                                            value={replyText}
                                                            onChange={e => setReplyText(e.target.value)}
                                                            onKeyDown={e => e.key === 'Enter' && handleReply(post.id)}
                                                        />
                                                        <button className="send-reply-btn" onClick={() => handleReply(post.id)} disabled={!replyText.trim()}>
                                                            <Send size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {!showCompose && (
                                <button className="floating-compose-btn" onClick={() => setShowCompose(true)}>
                                    <Plus size={24} /> Redactar Post
                                </button>
                            )}
                        </>
                    )}

                    {activeTab === 'map' && (
                        <div className="map-view-container glass-card">
                            <GlobalMap />
                        </div>
                    )}

                    {activeTab === 'leaders' && (
                        <div className="leaders-view">
                            <div className="leader-podium">
                                <div className="podium-item second">
                                    <Trophy color="#C0C0C0" size={32} />
                                    <div className="user-initial">L</div>
                                    <span className="l-name">Luis (ES)</span>
                                    <span className="l-score">45 pts</span>
                                </div>
                                <div className="podium-item first">
                                    <Trophy color="#FFD700" size={40} />
                                    <div className="user-initial gold">A</div>
                                    <span className="l-name">Alex (UK)</span>
                                    <span className="l-score">100 pts</span>
                                </div>
                                <div className="podium-item third">
                                    <Trophy color="#CD7F32" size={28} />
                                    <div className="user-initial bronze">M</div>
                                    <span className="l-name">Maria (CO)</span>
                                    <span className="l-score">23 pts</span>
                                </div>
                            </div>

                            <div className="personal-rank glass-card">
                                <Sparkles size={20} color="#5856D6" />
                                <div className="prank-info">
                                    <span className="pr-rank">Tú estás en el puesto #248</span>
                                    <span className="pr-sub">Registra tus observaciones a diario para escalar.</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {showCompose && activeTab === 'forum' && (
                    <div className="compose-modal-overlay animate-fade">
                        <div className="compose-card glass-card">
                            <header className="c-header">
                                <h3>Crear Publicación</h3>
                                <button className="c-close" onClick={() => setShowCompose(false)}><X size={20}/></button>
                            </header>
                            
                            <div className="c-cats">
                                {CATEGORIES.filter(c => c.key !== 'all').map(cat => (
                                    <button
                                        key={cat.key}
                                        className={`cat-pill ${newPost.category === cat.key ? 'active' : ''}`}
                                        onClick={() => setNewPost(p => ({ ...p, category: cat.key }))}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                            
                            <textarea
                                className="premium-textarea"
                                placeholder="Comparte cómo te sientes hoy, es totalmente anónimo..."
                                value={newPost.text}
                                onChange={e => setNewPost(p => ({ ...p, text: e.target.value }))}
                                autoFocus
                            />

                            <button className="premium-btn full-width mt-10" onClick={handleCreatePost} disabled={!newPost.text.trim()}>
                                Publicar en la Red <Send size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community;
