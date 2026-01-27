import React, { useState, useEffect } from 'react';
import { useOutletContext, Link, useLocation } from 'react-router-dom';
import { MessageSquare, Trash2, Heart, Send, ChevronLeft, ChevronRight, Loader2, Reply } from 'lucide-react';
import { userAPI } from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

// Recursive component for rendering comments
const CommentNode = ({ comment, depth = 0, onReply, onDelete, user, isOwner, profile }) => {
    return (
        <div className={`relative ${depth > 0 ? 'mt-2' : ''}`}>
            {/* Connecting line for nested comments */}
            {depth > 0 && (
                <div
                    className="absolute -left-4 top-0 w-4 h-8 border-l border-b border-white/10 rounded-bl-xl"
                    style={{ left: '-1rem', top: '-0.5rem' }}
                ></div>
            )}

            <div className="flex gap-3 group/comment relative">
                <Link to={`/user/${(comment.author.custom_url && !comment.author.custom_url.includes('/')) ? comment.author.custom_url : comment.author.id}`} className="flex-shrink-0 relative z-10">
                    <div className="w-8 h-8 bg-black border border-white/10">
                        <img src={comment.author.avatar_medium || '/defolt.png'} className="w-full h-full object-cover" />
                    </div>
                </Link>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Link to={`/user/${(comment.author.custom_url && !comment.author.custom_url.includes('/')) ? comment.author.custom_url : comment.author.id}`} className="font-bold text-white text-xs hover:text-cs-orange transition-colors">
                            {comment.author.nickname}
                        </Link>
                        <span className="text-[10px] text-cs-text font-mono">
                            {new Date(comment.created_at).toLocaleString()}
                        </span>
                        {user && (isOwner || profile.privacy?.can_post_on_wall) && (
                            <button
                                onClick={() => onReply(comment)}
                                className="text-gray-500 hover:text-white opacity-0 group-hover/comment:opacity-100 transition-opacity ml-2"
                                title="Ответить"
                            >
                                <Reply className="w-3 h-3" />
                            </button>
                        )}
                        {user && (user.id === comment.author.id || isOwner) && (
                            <button
                                onClick={() => onDelete(comment.id)}
                                className="text-white/20 hover:text-red-500 opacity-0 group-hover/comment:opacity-100 transition-opacity ml-auto"
                                title="Удалить"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                    <div className="text-xs text-gray-300 mt-1 break-words whitespace-pre-wrap">
                        {comment.content}
                    </div>
                </div>
            </div>

            {/* Render children */}
            {comment.children && comment.children.length > 0 && (
                <div className="pl-4 md:pl-8 border-l border-white/5 ml-4 mt-2">
                    {comment.children.map(child => (
                        <CommentNode
                            key={child.id}
                            comment={child}
                            depth={depth + 1}
                            onReply={onReply}
                            onDelete={onDelete}
                            user={user}
                            isOwner={isOwner}
                            profile={profile}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const ProfileWall = () => {
    const { profile, isOwner, user, setProfile } = useOutletContext();

    const [posts, setPosts] = useState(profile.wall_posts || []);
    const [totalPosts, setTotalPosts] = useState(profile.wall_posts_count || 0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(Math.ceil((profile.wall_posts_count || 0) / 5));
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);

    const [newPostContent, setNewPostContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [likeLoadings, setLikeLoadings] = useState({});
    const [isDeletingAll, setIsDeletingAll] = useState(false);

    const fetchPosts = async (page) => {
        try {
            setIsLoadingPosts(true);
            const response = await userAPI.getWallPosts(profile.user.id, page, 5);
            setPosts(response.data.posts);
            setTotalPosts(response.data.total_posts);
            setTotalPages(parseInt(response.data.total_pages));
            setCurrentPage(page);
        } catch (err) {
            console.error('Failed to fetch posts:', err);
        } finally {
            setIsLoadingPosts(false);
        }
    };

    useEffect(() => {
        fetchPosts(1);
    }, [profile.user.id]);

    const location = useLocation();

    useEffect(() => {
        if (location.hash && !isLoadingPosts && posts.length > 0) {
            const id = location.hash.replace('#post-', '');
            const element = document.getElementById(`post-${id}`);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('ring-2', 'ring-cs-orange', 'ring-offset-2', 'ring-offset-black');
                    setTimeout(() => {
                        element.classList.remove('ring-2', 'ring-cs-orange', 'ring-offset-2', 'ring-offset-black');
                    }, 2000);
                }, 500);
            }
        }
    }, [location.hash, isLoadingPosts, posts]);

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        fetchPosts(newPage);
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) return;
        try {
            setIsPosting(true);
            await userAPI.createWallPost(newPostContent, profile.user.id);
            setNewPostContent('');
            fetchPosts(1);
        } catch (err) {
            console.error('Failed to create post:', err);
        } finally {
            setIsPosting(false);
        }
    }

    const handleDeletePost = async (postId) => {
        if (!confirm('Удалить пост?')) return;
        try {
            await userAPI.deleteWallPost(postId);
            if (posts.length === 1 && currentPage > 1) {
                fetchPosts(currentPage - 1);
            } else {
                fetchPosts(currentPage);
            }
        } catch (err) {
            console.error('Failed to delete post:', err);
        }
    }

    const handleDeleteAllPosts = async () => {
        if (!confirm('Вы уверены, что хотите удалить ВСЕ записи со стены? Это действие нельзя отменить.')) return;

        setIsDeletingAll(true);
        try {
            let hasMore = true;
            while (hasMore) {
                const response = await userAPI.getWallPosts(profile.user.id, 1, 10);
                const batchPosts = response.data.posts;
                if (batchPosts.length === 0) {
                    hasMore = false;
                    break;
                }
                await Promise.all(batchPosts.map(post => userAPI.deleteWallPost(post.id)));
                await new Promise(r => setTimeout(r, 500));
            }
            fetchPosts(1);
        } catch (err) {
            console.error('Failed to delete all posts:', err);
            alert('Произошла ошибка при удалении записей. Попробуйте обновить страницу.');
        } finally {
            setIsDeletingAll(false);
        }
    }

    const handleLike = async (postId) => {
        if (!user) return;
        if (likeLoadings[postId]) return;

        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex === -1) return;

        const post = posts[postIndex];
        const originalIsLiked = post.is_liked;
        const originalCount = post.likes_count;

        const newIsLiked = !originalIsLiked;
        const newCount = originalCount + (newIsLiked ? 1 : -1);

        let newLikers = post.likers ? [...post.likers] : [];
        if (newIsLiked) {
            newLikers.push({
                id: user.id,
                nickname: user.nickname,
                avatar_medium: user.avatar_medium,
                custom_url: user.custom_url
            });
        } else {
            newLikers = newLikers.filter(l => l.id !== user.id);
        }

        const updatedPosts = [...posts];
        updatedPosts[postIndex] = { ...post, is_liked: newIsLiked, likes_count: newCount, likers: newLikers };
        setPosts(updatedPosts);

        setLikeLoadings(prev => ({ ...prev, [postId]: true }));

        try {
            const response = await userAPI.toggleLikeWallPost(postId);
            const syncedPosts = [...posts];
            const currentIndex = syncedPosts.findIndex(p => p.id === postId);
            if (currentIndex !== -1) {
                syncedPosts[currentIndex] = {
                    ...syncedPosts[currentIndex],
                    is_liked: response.data.is_liked,
                    likes_count: response.data.likes_count || syncedPosts[currentIndex].likes_count,
                    likers: response.data.likers || syncedPosts[currentIndex].likers
                };
                setPosts(syncedPosts);
            }
        } catch (err) {
            console.error('Failed to like post:', err);
            const revertedPosts = [...posts];
            const revertedIndex = revertedPosts.findIndex(p => p.id === postId);
            if (revertedIndex !== -1) {
                revertedPosts[revertedIndex] = { ...post, is_liked: originalIsLiked, likes_count: originalCount, likers: post.likers };
                setPosts(revertedPosts);
            }
        } finally {
            setLikeLoadings(prev => ({ ...prev, [postId]: false }));
        }
    }

    const [replyingTo, setReplyingTo] = useState(null);
    const [replyingToComment, setReplyingToComment] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    const handleReplyClick = (postId, comment = null) => {
        if (replyingTo === postId && replyingToComment?.id === comment?.id) {
            setReplyingTo(null);
            setReplyingToComment(null);
            setReplyContent('');
        } else {
            setReplyingTo(postId);
            setReplyingToComment(comment);
            if (comment) {
                setReplyContent(`${comment.author.nickname}, `);
            } else {
                setReplyContent('');
            }
        }
    };

    const handleSubmitReply = async (postId) => {
        if (!replyContent.trim()) return;
        try {
            setIsSubmittingReply(true);
            const response = await userAPI.createWallPostComment(postId, replyContent);
            const updatedPosts = posts.map(p => {
                if (p.id === postId) {
                    return {
                        ...p,
                        comments: [...(p.comments || []), response.data]
                    };
                }
                return p;
            });
            setPosts(updatedPosts);
            setReplyingTo(null);
            setReplyingToComment(null);
            setReplyContent('');
        } catch (err) {
            console.error('Failed to submit reply:', err);
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        if (!confirm('Удалить комментарий?')) return;
        try {
            await userAPI.deleteWallPostComment(commentId);
            const updatedPosts = posts.map(p => {
                if (p.id === postId) {
                    return {
                        ...p,
                        comments: p.comments.filter(c => c.id !== commentId)
                    };
                }
                return p;
            });
            setPosts(updatedPosts);
        } catch (err) {
            console.error('Failed to delete comment:', err);
        }
    };

    const organizeComments = (comments) => {
        if (!comments) return [];
        const commentsList = JSON.parse(JSON.stringify(comments));
        const rootComments = [];
        const map = {};
        commentsList.forEach(c => {
            c.children = [];
            map[c.id] = c;
        });
        commentsList.forEach((c, index) => {
            let parentFound = false;
            const match = c.content.match(/^([^\s,]+),\s/);
            if (match) {
                const mentionedName = match[1];
                for (let i = index - 1; i >= 0; i--) {
                    const potentialParent = commentsList[i];
                    if (potentialParent.author.nickname === mentionedName) {
                        potentialParent.children.push(c);
                        parentFound = true;
                        break;
                    }
                }
            }
            if (!parentFound) {
                rootComments.push(c);
            }
        });
        return rootComments;
    };

    return (
        <div className="space-y-6">
            {/* Create Post Section */}
            {user && (isOwner || profile.privacy?.can_post_on_wall) && (
                <div className="bg-cs-surface border border-white/10 clip-path-slant">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center">
                        <div className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-cs-orange" />
                            Комментарии
                        </div>
                        {isOwner && totalPosts > 0 && (
                            <button
                                onClick={handleDeleteAllPosts}
                                disabled={isDeletingAll}
                                className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors disabled:opacity-50"
                            >
                                {isDeletingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                {isDeletingAll ? 'Удаление...' : 'Удалить все'}
                            </button>
                        )}
                    </div>
                    <div className="p-4 flex gap-4 items-start">
                        <div className="w-10 h-10 bg-black border border-white/10 flex-shrink-0">
                            <img src={user.avatar_medium || '/defolt.png'} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Введите ваше сообщение..."
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleCreatePost();
                                    }
                                }}
                                className="w-full bg-black/40 border border-white/10 py-3 pl-4 pr-12 text-sm text-white focus:border-cs-orange focus:outline-none transition-all placeholder:text-white/30"
                            />
                            <button
                                onClick={handleCreatePost}
                                disabled={isPosting || !newPostContent.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-cs-orange transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-1"
                            >
                                {isPosting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Posts List or Empty State */}
            {isLoadingPosts ? (
                <div className="bg-cs-surface border border-white/10 p-12 clip-path-slant flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-cs-orange" />
                </div>
            ) : posts.length > 0 ? (
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {posts.map(post => {
                            const organizedComments = organizeComments(post.comments);
                            return (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    id={`post-${post.id}`}
                                    className="bg-cs-surface border border-white/10 p-5 clip-path-slant relative group"
                                >
                                    {/* Delete Button */}
                                    {user && (user.id === post.author.id || isOwner) && (
                                        <button
                                            onClick={() => handleDeletePost(post.id)}
                                            className="absolute top-4 right-4 text-white/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            title="Удалить"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}

                                    <div className="flex gap-4">
                                        <Link to={`/user/${(post.author.custom_url && !post.author.custom_url.includes('/')) ? post.author.custom_url : post.author.id}`} className="block flex-shrink-0">
                                            <div className="w-12 h-12 bg-black border border-white/10 overflow-hidden hover:border-cs-orange transition-colors">
                                                <img src={post.author.avatar_medium || '/defolt.png'} className="w-full h-full object-cover" />
                                            </div>
                                        </Link>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col mb-2">
                                                <Link to={`/user/${(post.author.custom_url && !post.author.custom_url.includes('/')) ? post.author.custom_url : post.author.id}`} className="font-bold text-white hover:text-cs-orange transition-colors text-sm uppercase tracking-wide w-fit">
                                                    {post.author.nickname}
                                                </Link>
                                                <div className="text-[10px] text-cs-text font-mono mt-0.5">
                                                    {new Date(post.created_at).toLocaleString()}
                                                </div>
                                            </div>

                                            <div className="text-sm text-gray-200 leading-relaxed font-light break-words whitespace-pre-wrap">
                                                {post.content}
                                            </div>

                                            {/* Action Bar */}
                                            <div className="mt-4 flex items-center gap-4 border-t border-white/5 pt-3">
                                                <div className="relative group/like">
                                                    <button
                                                        onClick={() => handleLike(post.id)}
                                                        className={`flex items-center gap-2 text-sm font-bold transition-colors px-2 py-1 -ml-2 rounded hover:bg-white/5 ${post.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'} ${!user ? 'cursor-default' : ''}`}
                                                        disabled={!user}
                                                    >
                                                        <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-current' : ''}`} />
                                                        <span>{post.likes_count || 0}</span>
                                                    </button>
                                                </div>

                                                {user && (isOwner || profile.privacy?.can_post_on_wall) && (
                                                    <button
                                                        onClick={() => handleReplyClick(post.id)}
                                                        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5"
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                        <span>Ответить</span>
                                                    </button>
                                                )}
                                            </div>

                                            {/* Comments */}
                                            {organizedComments && organizedComments.length > 0 && (
                                                <div className="mt-4 space-y-4 pl-4 border-l-2 border-white/5">
                                                    {organizedComments.map(comment => (
                                                        <CommentNode
                                                            key={comment.id}
                                                            comment={comment}
                                                            onReply={(c) => handleReplyClick(post.id, c)}
                                                            onDelete={(cid) => handleDeleteComment(post.id, cid)}
                                                            user={user}
                                                            isOwner={isOwner}
                                                            profile={profile}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {/* Reply Input */}
                                            {replyingTo === post.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-4 flex gap-3"
                                                >
                                                    <div className="w-8 h-8 bg-black border border-white/10 flex-shrink-0">
                                                        <img src={user.avatar_medium || '/defolt.png'} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 relative">
                                                        <input
                                                            placeholder={replyingToComment ? `Ответ для ${replyingToComment.author.nickname}...` : "Написать комментарий..."}
                                                            value={replyContent}
                                                            onChange={(e) => setReplyContent(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                    e.preventDefault();
                                                                    handleSubmitReply(post.id);
                                                                }
                                                            }}
                                                            className="w-full bg-black/40 border border-white/10 py-2 pl-3 pr-10 text-xs text-white focus:border-cs-orange focus:outline-none transition-all placeholder:text-white/40"
                                                            autoFocus
                                                        />
                                                        <button
                                                            onClick={() => handleSubmitReply(post.id)}
                                                            disabled={isSubmittingReply || !replyContent.trim()}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-cs-orange transition-colors disabled:opacity-30 p-1"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="bg-cs-surface border border-white/10 p-12 clip-path-slant flex flex-col items-center justify-center min-h-[300px]">
                    <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center mb-4 border border-white/5">
                        <MessageSquare className="w-8 h-8 text-white/20" />
                    </div>
                    <div className="text-cs-text font-medium">На стене пока нет ни одной записи.</div>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-8 h-8 font-bold text-sm border ${currentPage === page ? 'bg-cs-orange text-black border-cs-orange' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'} transition-colors`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfileWall;
