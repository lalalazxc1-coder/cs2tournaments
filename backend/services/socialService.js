const {
    User,
    WallPost,
    WallPostLike,
    WallPostComment,
    Notification,
    Friend
} = require('../models');
const { Op } = require('sequelize');
const { emitNotification } = require('../websocket');
const logger = require('../utils/logger');

class SocialService {

    async createPost(authorId, targetUserId, content, authorNickname) {
        // Check if target user exists
        const targetUser = await User.findByPk(targetUserId);
        if (!targetUser) {
            throw new Error('User not found');
        }

        // Check Privacy
        if (authorId !== targetUserId) {
            let privacy = targetUser.privacy_settings;
            if (typeof privacy === 'string') {
                try { privacy = JSON.parse(privacy); } catch (e) { privacy = {}; }
            }
            privacy = { wall_visibility: 'public', ...privacy };

            if (privacy.wall_visibility !== 'public') {
                if (privacy.wall_visibility === 'friends') {
                    const friendship = await Friend.findOne({
                        where: {
                            [Op.or]: [
                                { user_id: authorId, friend_id: targetUserId, status: 'accepted' },
                                { user_id: targetUserId, friend_id: authorId, status: 'accepted' }
                            ]
                        }
                    });
                    if (!friendship) {
                        throw new Error('Only friends can post on this wall');
                    }
                } else if (privacy.wall_visibility === 'private') {
                    throw new Error('This wall is private');
                }
            }
        }

        const newPost = await WallPost.create({
            user_id: targetUserId,
            author_id: authorId,
            content
        });

        // Fetch created post with author
        const postWithAuthor = await WallPost.findByPk(newPost.id, {
            include: [
                { model: User, as: 'author', attributes: ['id', 'nickname', 'avatar_medium', 'custom_url'] },
                { model: WallPostLike, as: 'likes', attributes: ['user_id'] },
                { model: WallPostComment, as: 'comments', include: [{ model: User, as: 'author', attributes: ['id', 'nickname', 'avatar_medium', 'custom_url'] }] }
            ]
        });

        // Notify target user if not self
        if (authorId !== targetUserId) {
            await Notification.create({
                user_id: targetUserId,
                type: 'wall_post',
                message: `${authorNickname} написал на вашей стене`,
                related_id: newPost.id,
                link: `/user/${targetUser.custom_url || targetUser.id}#post-${newPost.id}`
            });
            emitNotification(targetUserId, {
                type: 'wall_post',
                message: `${authorNickname} написал на вашей стене`
            });
        }

        const plainPost = postWithAuthor.toJSON();
        plainPost.likes_count = 0;
        plainPost.is_liked = false;
        plainPost.likers = [];

        return plainPost;
    }

    async deletePost(userId, postId) {
        const post = await WallPost.findByPk(postId);
        if (!post) {
            throw new Error('Post not found');
        }

        // Allow deletion if user is author OR owner of the wall
        if (post.author_id !== userId && post.user_id !== userId) {
            throw new Error('Not authorized to delete this post');
        }

        await post.destroy();
        return true;
    }

    async toggleLike(userId, postId, userNickname) {
        const post = await WallPost.findByPk(postId);
        if (!post) {
            throw new Error('Post not found');
        }

        const existingLike = await WallPostLike.findOne({
            where: { wall_post_id: postId, user_id: userId }
        });

        if (existingLike) {
            await existingLike.destroy();
        } else {
            await WallPostLike.create({
                wall_post_id: postId,
                user_id: userId
            });

            // Notify post author if not self
            if (post.author_id !== userId) {
                await Notification.create({
                    user_id: post.author_id,
                    type: 'like',
                    message: `${userNickname} лайкнул вашу запись`,
                    related_id: postId,
                    link: `/user/${post.user_id}#post-${postId}`
                });
                emitNotification(post.author_id, {
                    type: 'like',
                    message: `${userNickname} лайкнул вашу запись`
                });
            }
        }

        // Fetch updated likes
        const likes = await WallPostLike.findAll({
            where: { wall_post_id: postId },
            include: [{ model: User, as: 'user', attributes: ['id', 'nickname', 'avatar_medium', 'custom_url'] }]
        });

        const likesCount = likes.length;
        const isLiked = likes.some(like => like.user_id === userId);
        const likers = likes.map(like => like.user);

        return {
            message: isLiked ? 'Liked' : 'Unliked',
            is_liked: isLiked,
            likes_count: likesCount,
            likers: likers
        };
    }

    async addComment(userId, postId, content, userNickname) {
        const post = await WallPost.findByPk(postId);
        if (!post) {
            throw new Error('Post not found');
        }

        const comment = await WallPostComment.create({
            wall_post_id: postId,
            author_id: userId,
            content
        });

        const commentWithAuthor = await WallPostComment.findByPk(comment.id, {
            include: [{ model: User, as: 'author', attributes: ['id', 'nickname', 'avatar_medium', 'custom_url'] }]
        });

        // Notify post author if not self
        if (post.author_id !== userId) {
            await Notification.create({
                user_id: post.author_id,
                type: 'comment',
                message: `${userNickname} прокомментировал вашу запись`,
                related_id: postId,
                link: `/user/${post.user_id}#post-${postId}`
            });
            emitNotification(post.author_id, {
                type: 'comment',
                message: `${userNickname} прокомментировал вашу запись`
            });
        }

        return commentWithAuthor;
    }

    async deleteComment(userId, commentId) {
        const comment = await WallPostComment.findByPk(commentId, {
            include: [{ model: WallPost, as: 'wallPost' }]
        });

        if (!comment) {
            throw new Error('Comment not found');
        }

        if (comment.author_id !== userId && comment.wallPost.user_id !== userId) {
            throw new Error('Not authorized to delete this comment');
        }

        await comment.destroy();
        return true;
    }

    async getWallPosts(identifier, page = 1, limit = 5, viewerId = null) {
        const offset = (page - 1) * limit;

        let user;
        if (/^\d+$/.test(identifier)) {
            user = await User.findByPk(identifier);
        } else {
            user = await User.findOne({ where: { custom_url: identifier } });
        }

        if (!user) {
            throw new Error('User not found');
        }

        const userId = user.id;

        const { count, rows } = await WallPost.findAndCountAll({
            where: { user_id: userId },
            include: [
                { model: User, as: 'author', attributes: ['id', 'nickname', 'avatar_medium', 'custom_url'] },
                {
                    model: WallPostLike,
                    as: 'likes',
                    attributes: ['user_id'],
                    include: [{ model: User, as: 'user', attributes: ['id', 'nickname', 'avatar_medium', 'custom_url'] }]
                },
                {
                    model: WallPostComment,
                    as: 'comments',
                    include: [{ model: User, as: 'author', attributes: ['id', 'nickname', 'avatar_medium', 'custom_url'] }]
                }
            ],
            order: [
                ['created_at', 'DESC'],
                [{ model: WallPostComment, as: 'comments' }, 'created_at', 'ASC']
            ],
            limit,
            offset,
            distinct: true
        });

        const posts = rows.map(post => {
            const plainPost = post.toJSON();
            plainPost.likes_count = plainPost.likes.length;
            plainPost.is_liked = viewerId ? plainPost.likes.some(like => like.user_id === viewerId) : false;
            plainPost.likers = plainPost.likes.map(like => like.user);
            delete plainPost.likes;
            return plainPost;
        });

        return {
            posts,
            total_posts: count,
            total_pages: Math.ceil(count / limit),
            current_page: page
        };
    }

    async handleFriendRequest(userId, targetId, userNickname, userCustomUrl) {
        if (userId === targetId) {
            throw new Error('Cannot add yourself as friend');
        }

        const targetUser = await User.findByPk(targetId);
        if (!targetUser) {
            throw new Error('User not found');
        }

        const existingFriendship = await Friend.findOne({
            where: {
                [Op.or]: [
                    { user_id: userId, friend_id: targetId },
                    { user_id: targetId, friend_id: userId }
                ]
            }
        });

        if (existingFriendship) {
            if (existingFriendship.status === 'accepted') {
                throw new Error('Already friends');
            }

            if (existingFriendship.user_id === userId) {
                throw new Error('Request already sent');
            } else {
                // Accept request
                existingFriendship.status = 'accepted';
                await existingFriendship.save();

                await Notification.create({
                    user_id: targetId,
                    type: 'friend_accept',
                    message: `${userNickname} принял вашу заявку в друзья`,
                    related_id: userId,
                    link: `/user/${userCustomUrl || userId}`
                });
                emitNotification(targetId, {
                    type: 'friend_accept',
                    message: `${userNickname} принял вашу заявку в друзья`
                });

                return { message: 'Friend request accepted', status: 'friends' };
            }
        }

        // Create new request
        await Friend.create({
            user_id: userId,
            friend_id: targetId,
            status: 'pending'
        });

        await Notification.create({
            user_id: targetId,
            type: 'friend_request',
            message: `${userNickname} отправил вам заявку в друзья`,
            related_id: userId,
            link: `/user/${userCustomUrl || userId}`
        });
        emitNotification(targetId, {
            type: 'friend_request',
            message: `${userNickname} отправил вам заявку в друзья`
        });

        return { message: 'Friend request sent', status: 'pending_sent' };
    }

    async removeFriend(userId, targetId) {
        const friendship = await Friend.findOne({
            where: {
                [Op.or]: [
                    { user_id: userId, friend_id: targetId },
                    { user_id: targetId, friend_id: userId }
                ]
            }
        });

        if (!friendship) {
            throw new Error('Friendship not found');
        }

        await friendship.destroy();
        return { message: 'Removed from friends', status: 'none' };
    }
}

module.exports = new SocialService();
