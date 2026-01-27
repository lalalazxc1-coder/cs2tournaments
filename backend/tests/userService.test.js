const userService = require('../services/userService');
const { sequelize, User, PlayerSummary, Lobby, TournamentBracket, TeamMember, Team, Friend, WallPost, NicknameHistory } = require('../models');

// Mock models
jest.mock('../models', () => ({
    sequelize: {
        query: jest.fn((...args) => {
            console.log('Sequelize Query Called:', args[0].substring(0, 50));
            return Promise.resolve([[], null]);
        }),
        QueryTypes: { SELECT: 'SELECT' }
    },
    User: {
        findByPk: jest.fn(),
        findOne: jest.fn()
    },
    PlayerSummary: {
        findOne: jest.fn()
    },
    Friend: {
        findAll: jest.fn(),
        findOne: jest.fn()
    },
    TeamMember: {
        findAll: jest.fn(),
        count: jest.fn()
    },
    WallPost: {
        findAll: jest.fn(),
        count: jest.fn()
    },
    NicknameHistory: {
        findAll: jest.fn()
    }
}));

jest.mock('../utils/logger', () => ({
    error: jest.fn((msg, err) => console.error('MOCKED LOGGER ERROR:', msg, err)),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
}));

describe('UserService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getUserStats', () => {
        it('should return default stats if no steam_id', async () => {
            // ... (rest is same, but resetAllMocks clears implementations too, so I need to re-mock if needed)
            // But I define mocks inside tests mostly.

            const user = { id: 1, nickname: 'TestUser', steam_id: null };
            const stats = await userService.getUserStats(user);

            expect(stats).toEqual(expect.objectContaining({
                player_name: 'TestUser',
                rating: 0,
                rank: 0
            }));
        });

        it('should calculate stats correctly for user with steam_id', async () => {
            const user = {
                id: 1,
                nickname: 'ProPlayer',
                steam_id: '123456789',
                getDisplayName: () => 'ProPlayer'
            };

            PlayerSummary.findOne.mockResolvedValue({
                player_name: 'ProPlayer',
                rating: 1500,
                total_matches: 10,
                last_updated: '2023-01-01'
            });

            sequelize.query
                .mockResolvedValueOnce([{ count: 5 }]) // Rank query (SELECT type)
                .mockResolvedValueOnce([[{ count: 2 }]]) // Lobby count (Raw) -> returns [results, metadata]
                .mockResolvedValueOnce([[{ count: 3 }]]); // Tournament match count (Raw)

            const stats = await userService.getUserStats(user);

            const logger = require('../utils/logger');
            if (logger.error.mock.calls.length > 0) {
                console.log('Logger Error Calls:', logger.error.mock.calls);
            }
            console.log('DEBUG STATS:', JSON.stringify(stats, null, 2));

            console.log('Rating:', stats.rating, typeof stats.rating);
            console.log('Rank:', stats.rank, typeof stats.rank);
            console.log('Matches:', stats.internal_matches_count, typeof stats.internal_matches_count);

            expect(stats.rating).toBe(1500);
            expect(stats.rank).toBe(6);
            expect(stats.internal_matches_count).toBe(5);
        });
    });

    describe('getTournamentCount', () => {
        it('should return correct count', async () => {
            // Mock return value: [results, metadata]
            sequelize.query.mockResolvedValueOnce([
                [{ id: 1 }, { id: 2 }], // results
                null // metadata
            ]);
            const count = await userService.getTournamentCount(1);
            expect(count).toBe(2);
        });
    });


});
