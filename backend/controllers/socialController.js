const { validationResult } = require('express-validator');
const socialService = require('../services/socialService');

exports.createWallPost = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const authorId = req.user.userId;
        const { content, target_user_id } = req.body;
        const authorNickname = req.user.nickname;

        const result = await socialService.createPost(authorId, target_user_id, content, authorNickname);
        res.status(201).json(result);

    } catch (error) {
        if (error.message === 'User not found') return res.status(404).json({ message: error.message });
        if (error.message === 'Only friends can post on this wall' || error.message === 'This wall is private') {
            return res.status(403).json({ message: error.message });
        }
        next(error);
    }
};

exports.deleteWallPost = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const postId = req.params.id;

        await socialService.deletePost(userId, postId);
        res.json({ message: 'Post deleted' });

    } catch (error) {
        if (error.message === 'Post not found') return res.status(404).json({ message: error.message });
        if (error.message === 'Not authorized to delete this post') return res.status(403).json({ message: error.message });
        next(error);
    }
};

exports.likeWallPost = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const postId = req.params.id;
        const userNickname = req.user.nickname;

        const result = await socialService.toggleLike(userId, postId, userNickname);
        res.json(result);

    } catch (error) {
        if (error.message === 'Post not found') return res.status(404).json({ message: error.message });
        next(error);
    }
};

exports.commentWallPost = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const userId = req.user.userId;
        const postId = req.params.id;
        const { content } = req.body;
        const userNickname = req.user.nickname;

        const result = await socialService.addComment(userId, postId, content, userNickname);
        res.status(201).json(result);

    } catch (error) {
        if (error.message === 'Post not found') return res.status(404).json({ message: error.message });
        next(error);
    }
};

exports.deleteComment = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const commentId = req.params.id;

        await socialService.deleteComment(userId, commentId);
        res.json({ message: 'Comment deleted' });

    } catch (error) {
        if (error.message === 'Comment not found') return res.status(404).json({ message: error.message });
        if (error.message === 'Not authorized to delete this comment') return res.status(403).json({ message: error.message });
        next(error);
    }
};

exports.getWallPosts = async (req, res, next) => {
    try {
        const { identifier } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const viewerId = req.user ? req.user.userId : null;

        const result = await socialService.getWallPosts(identifier, page, limit, viewerId);
        res.json(result);

    } catch (error) {
        if (error.message === 'User not found') return res.status(404).json({ message: error.message });
        next(error);
    }
};

exports.addFriend = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const targetId = parseInt(req.params.id);
        const userNickname = req.user.nickname;
        const userCustomUrl = req.user.custom_url;

        const result = await socialService.handleFriendRequest(userId, targetId, userNickname, userCustomUrl);
        res.json(result);

    } catch (error) {
        if (error.message === 'Cannot add yourself as friend' || error.message === 'Already friends' || error.message === 'Request already sent') {
            return res.status(400).json({ message: error.message });
        }
        if (error.message === 'User not found') return res.status(404).json({ message: error.message });
        next(error);
    }
};

exports.removeFriend = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const targetId = parseInt(req.params.id);

        const result = await socialService.removeFriend(userId, targetId);
        res.json(result);

    } catch (error) {
        if (error.message === 'Friendship not found') return res.status(404).json({ message: error.message });
        next(error);
    }
};
