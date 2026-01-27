const dashboardService = require('../services/dashboardService');
const { Lobby, User } = require('../models');
const { sequelize } = require('../config/database');

// Mock dependencies
jest.mock('../models', () => ({
    Lobby: {
        count: jest.fn(),
        findAll: jest.fn()
    },
    User: {
        count: jest.fn()
    }
}));

jest.mock('../config/database', () => ({
    sequelize: {
        query: jest.fn()
    }
}));

jest.mock('../utils/logger', () => ({
    error: jest.fn()
}));

describe('DashboardService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getStats', () => {
        it('should return correct stats', async () => {
            User.count.mockResolvedValue(100);
            Lobby.count
                .mockResolvedValueOnce(50) // Total
                .mockResolvedValueOnce(10); // Active

            const stats = await dashboardService.getStats();

            expect(stats).toEqual({
                total_players: 100,
                total_tournaments: 50,
                active_tournaments: 10
            });
        });
    });

    describe('getActiveTournaments', () => {
        it('should return active tournaments with participant counts', async () => {
            const mockLobbies = [
                { id: 1, name: 'Lobby 1', date_time: new Date('2023-01-01T12:00:00Z'), format: '5x5', max_participants: 10 },
                { id: 2, name: 'Lobby 2', date_time: null, format: '2x2', max_participants: 4 }
            ];
            Lobby.findAll.mockResolvedValue(mockLobbies);

            sequelize.query
                .mockResolvedValueOnce([[{ count: 5 }]]) // Lobby 1 participants
                .mockResolvedValueOnce([[{ count: 2 }]]); // Lobby 2 participants

            const result = await dashboardService.getActiveTournaments();

            expect(result).toHaveLength(2);
            expect(result[0].current_participants).toBe(5);
            expect(result[0].date_time).toContain('2023-01-01');
            expect(result[1].current_participants).toBe(2);
            expect(result[1].date_time).toBeNull();
        });
    });

    describe('getTopPlayers', () => {
        it('should return top players formatted correctly', async () => {
            const mockPlayers = [
                {
                    player_name: 'Player1',
                    nickname: 'Nick1',
                    k_d_ratio: 1.5,
                    win_rate: 60,
                    total_matches: 10,
                    wins: 6,
                    losses: 4,
                    total_kills: 150,
                    total_deaths: 100,
                    avg_adr: 80,
                    avg_hs_percent: 40,
                    user_id: 1,
                    steam_id: 'steam1',
                    custom_url: 'url1',
                    avatar_url: 'avatar1'
                }
            ];
            sequelize.query.mockResolvedValue([mockPlayers]);

            const result = await dashboardService.getTopPlayers();

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Nick1');
            expect(result[0].kd_ratio).toBe(1.5);
            expect(result[0].rank).toBe(1);
        });
    });
});
