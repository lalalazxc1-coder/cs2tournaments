const socialService = require('../services/socialService');
const { User, WallPost, WallPostLike, WallPostComment, Notification, Friend } = require('../models');

// Mock models
jest.mock('../models', () => ({
    User: {
        findByPk: jest.fn(),
        findOne: jest.fn()
    },
    WallPost: {
        create: jest.fn(),
        findByPk: jest.fn(),
        findAndCountAll: jest.fn()
    },
    WallPostLike: {
        findOne: jest.fn(),
        create: jest.fn(),
        findAll: jest.fn()
    },
    WallPostComment: {
        create: jest.fn(),
        findByPk: jest.fn()
    },
    Notification: {
        create: jest.fn()
    },
    Friend: {
        findOne: jest.fn(),
        create: jest.fn()
    }
}));

jest.mock('../websocket', () => ({
    emitNotification: jest.fn()
}));

jest.mock('../utils/logger', () => ({
    error: jest.fn()
}));

describe('SocialService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createPost', () => {
        it('should create a post successfully', async () => {
            User.findByPk.mockResolvedValue({ id: 2, privacy_settings: { wall_visibility: 'public' } });
            WallPost.create.mockResolvedValue({ id: 101 });
            WallPost.findByPk.mockResolvedValue({
                toJSON: () => ({ id: 101, content: 'Hello' })
            });

            const result = await socialService.createPost(1, 2, 'Hello', 'Author');

            expect(result.id).toBe(101);
            expect(WallPost.create).toHaveBeenCalledWith({
                user_id: 2,
                author_id: 1,
                content: 'Hello'
            });
        });

        it('should throw error if user not found', async () => {
            User.findByPk.mockResolvedValue(null);
            await expect(socialService.createPost(1, 999, 'Hi', 'Author'))
                .rejects.toThrow('User not found');
        });
    });

    describe('toggleLike', () => {
        it('should like a post if not liked', async () => {
            WallPost.findByPk.mockResolvedValue({ id: 10, author_id: 2, user_id: 2 });
            WallPostLike.findOne.mockResolvedValue(null); // Not liked yet
            WallPostLike.findAll.mockResolvedValue([{ user_id: 1, user: { id: 1 } }]); // After like

            const result = await socialService.toggleLike(1, 10, 'Liker');

            expect(result.is_liked).toBe(true);
            expect(result.message).toBe('Liked');
            expect(WallPostLike.create).toHaveBeenCalled();
        });

        it('should unlike a post if already liked', async () => {
            const mockLike = { destroy: jest.fn() };
            WallPost.findByPk.mockResolvedValue({ id: 10 });
            WallPostLike.findOne.mockResolvedValue(mockLike); // Already liked
            WallPostLike.findAll.mockResolvedValue([]); // After unlike

            const result = await socialService.toggleLike(1, 10, 'Liker');

            expect(result.is_liked).toBe(false);
            expect(result.message).toBe('Unliked');
            expect(mockLike.destroy).toHaveBeenCalled();
        });
    });

    describe('handleFriendRequest', () => {
        it('should send friend request if none exists', async () => {
            User.findByPk.mockResolvedValue({ id: 2 });
            Friend.findOne.mockResolvedValue(null);

            const result = await socialService.handleFriendRequest(1, 2, 'Sender', 'url');

            expect(result.status).toBe('pending_sent');
            expect(Friend.create).toHaveBeenCalledWith({
                user_id: 1,
                friend_id: 2,
                status: 'pending'
            });
        });

        it('should accept friend request if pending from other', async () => {
            User.findByPk.mockResolvedValue({ id: 2 });
            const mockFriendship = {
                user_id: 2, // Sent by other
                status: 'pending',
                save: jest.fn()
            };
            Friend.findOne.mockResolvedValue(mockFriendship);

            const result = await socialService.handleFriendRequest(1, 2, 'Receiver', 'url');

            expect(result.status).toBe('friends');
            expect(mockFriendship.status).toBe('accepted');
            expect(mockFriendship.save).toHaveBeenCalled();
        });
    });
});
