const matchService = require('../services/matchService');
const { sequelize } = require('../models');

// Mock dependencies
jest.mock('../config/database', () => ({
    sequelize: {
        query: jest.fn(),
        transaction: jest.fn()
    }
}));

jest.mock('../models', () => ({
    sequelize: {
        query: jest.fn(),
        transaction: jest.fn()
    },
    TournamentBracket: {
        findByPk: jest.fn(),
        findAll: jest.fn()
    },
    Tournament: {
        findByPk: jest.fn()
    }
}));

jest.mock('../utils/logger', () => ({
    error: jest.fn(),
    info: jest.fn()
}));

jest.mock('../utils/tournamentLogic', () => ({
    propagateWinner: jest.fn()
}));

describe('MatchService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getMatches', () => {
        it('should return paginated matches', async () => {
            sequelize.query
                .mockResolvedValueOnce([[{ match_id: 1 }, { match_id: 2 }]]) // Matches
                .mockResolvedValueOnce([[{ total: 10 }]]); // Count

            const result = await matchService.getMatches(1, 2);

            expect(result.matches.length).toBe(2);
            expect(result.total).toBe(10);
            expect(result.pages).toBe(5);
        });
    });

    describe('processMatchStats', () => {
        it('should process match stats successfully', async () => {
            const mockTransaction = {
                commit: jest.fn(),
                rollback: jest.fn()
            };
            sequelize.transaction.mockResolvedValue(mockTransaction);

            // 1. Check existing match -> [] (not found)
            sequelize.query.mockResolvedValueOnce([[]]);

            // 2. Insert match -> [matchId]
            sequelize.query.mockResolvedValueOnce([101]);

            // 3. Insert player stats (for 1 player)
            sequelize.query.mockResolvedValueOnce([]);

            // 4. Update player summary (for 1 player)
            sequelize.query.mockResolvedValueOnce([]);

            const matchData = { demo_filename: 'test.dem' };
            const playersData = [{
                player_steamid: '123',
                '5k': 0, '4k': 0, '3k': 0, '2k': 0
            }];

            const matchId = await matchService.processMatchStats(matchData, playersData);

            expect(matchId).toBe(101);
            expect(mockTransaction.commit).toHaveBeenCalled();
            expect(sequelize.query).toHaveBeenCalledTimes(4);
        });

        it('should rollback if match already exists', async () => {
            const mockTransaction = {
                commit: jest.fn(),
                rollback: jest.fn()
            };
            sequelize.transaction.mockResolvedValue(mockTransaction);

            // 1. Check existing match -> Found!
            sequelize.query.mockResolvedValueOnce([[{ match_id: 99 }]]);

            const matchData = { demo_filename: 'existing.dem' };
            const playersData = [];

            await expect(matchService.processMatchStats(matchData, playersData))
                .rejects.toThrow('Match already exists');

            expect(mockTransaction.rollback).toHaveBeenCalled();
            expect(mockTransaction.commit).not.toHaveBeenCalled();
        });
    });

    describe('getUnlinkedMatches', () => {
        it('should return unlinked matches', async () => {
            sequelize.query.mockResolvedValueOnce([[{ match_id: 1 }]]);
            const matches = await matchService.getUnlinkedMatches();
            expect(matches).toHaveLength(1);
            expect(matches[0].match_id).toBe(1);
        });
    });

    describe('linkMatch', () => {
        it('should link match to lobby', async () => {
            await matchService.linkMatch(1, { lobbyId: 10 });
            expect(sequelize.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE matches SET lobby_id'),
                expect.objectContaining({ replacements: [10, 1] })
            );
        });

        it('should link match to bracket and propagate winner', async () => {
            // Mock update match
            sequelize.query.mockResolvedValueOnce([]);
            // Mock fetch match
            sequelize.query.mockResolvedValueOnce([[{
                match_id: 1,
                team_a_score: 16,
                team_b_score: 5
            }]]);

            const mockBracket = {
                team1_id: 100,
                team2_id: 200,
                tournament_id: 99,
                save: jest.fn()
            };
            const { TournamentBracket, Tournament } = require('../models');
            TournamentBracket.findByPk.mockResolvedValue(mockBracket);
            TournamentBracket.findAll.mockResolvedValue([]);
            Tournament.findByPk.mockResolvedValue({ format: 'BO1' });

            await matchService.linkMatch(1, { bracketId: 50 });

            expect(mockBracket.winner_id).toBe(100); // Team A won
            expect(mockBracket.save).toHaveBeenCalled();
        });
    });
});
