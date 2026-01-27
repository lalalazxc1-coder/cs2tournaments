const { sequelize, TournamentBracket, Tournament } = require('../models');
const logger = require('../utils/logger');
const { propagateWinner } = require('../utils/tournamentLogic');

class MatchService {
    /**
     * Get unlinked matches
     */
    async getUnlinkedMatches() {
        const [matches] = await sequelize.query(`
            SELECT * FROM matches 
            WHERE lobby_id IS NULL 
            AND tournament_bracket_id IS NULL
            ORDER BY created_at DESC
        `);
        return matches;
    }

    /**
     * Link match to lobby or bracket
     * @param {number} matchId 
     * @param {Object} options { lobbyId, bracketId }
     */
    async linkMatch(matchId, { lobbyId, bracketId }) {
        if (lobbyId) {
            await sequelize.query('UPDATE matches SET lobby_id = ? WHERE match_id = ?', {
                replacements: [lobbyId, matchId]
            });
        } else if (bracketId) {
            // Link the match to the bracket
            await sequelize.query('UPDATE matches SET tournament_bracket_id = ? WHERE match_id = ?', {
                replacements: [bracketId, matchId]
            });

            // Fetch the match details to update the bracket
            const [matches] = await sequelize.query('SELECT * FROM matches WHERE match_id = ?', {
                replacements: [matchId]
            });

            if (matches.length > 0) {
                const matchData = matches[0];

                let winnerId = null;
                // Fetch bracket to get team IDs
                const bracket = await TournamentBracket.findByPk(bracketId);
                if (bracket) {
                    if (matchData.team_a_score > matchData.team_b_score) {
                        winnerId = bracket.team1_id;
                    } else if (matchData.team_b_score > matchData.team_a_score) {
                        winnerId = bracket.team2_id;
                    }

                    if (winnerId) {
                        bracket.winner_id = winnerId;
                        bracket.status = 'completed';
                        await bracket.save();

                        // Propagate winner
                        const allMatches = await TournamentBracket.findAll({
                            where: { tournament_id: bracket.tournament_id }
                        });
                        const tournament = await Tournament.findByPk(bracket.tournament_id);
                        await propagateWinner(bracket, allMatches, tournament.format);
                    }
                }
            }
        }
    }

    /**
     * Get paginated matches
     * @param {number} page 
     * @param {number} limit 
     */
    async getMatches(page = 1, limit = 20) {
        const offset = (page - 1) * limit;

        const [matches] = await sequelize.query(`
            SELECT 
                match_id, 
                map_name, 
                team_a_score, 
                team_b_score, 
                winning_team_name, 
                game_date, 
                total_rounds 
            FROM matches 
            ORDER BY match_id DESC 
            LIMIT :limit OFFSET :offset
        `, {
            replacements: {
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });

        const [countResult] = await sequelize.query('SELECT COUNT(*) as total FROM matches');
        const total = countResult[0].total;

        return {
            matches,
            total,
            pages: Math.ceil(total / limit),
            current_page: parseInt(page)
        };
    }

    /**
     * Get match details by ID
     * @param {number} matchId 
     */
    async getMatchDetails(matchId) {
        const [matches] = await sequelize.query('SELECT * FROM matches WHERE match_id = ?', {
            replacements: [matchId]
        });

        if (matches.length === 0) {
            return null;
        }

        const match = matches[0];

        const [playerStats] = await sequelize.query(`
            SELECT ps.*, u.nickname 
            FROM player_stats ps
            LEFT JOIN users u ON ps.player_steamid = u.steam_id
            WHERE ps.match_id = ?
            ORDER BY ps.kills DESC
        `, {
            replacements: [matchId]
        });

        return {
            match,
            player_stats: playerStats
        };
    }

    /**
     * Process and save match statistics
     * @param {Object} matchData 
     * @param {Array} playersData 
     */
    async processMatchStats(matchData, playersData) {
        const t = await sequelize.transaction();

        try {
            // Check if match exists
            const [existingMatch] = await sequelize.query(
                'SELECT match_id FROM matches WHERE demo_filename = ?',
                { replacements: [matchData.demo_filename], transaction: t }
            );

            if (existingMatch.length > 0) {
                await t.rollback();
                throw new Error('Match already exists');
            }

            // Insert Match
            const [matchResult] = await sequelize.query(`
                INSERT INTO matches (demo_filename, map_name, team_a_score, team_b_score, winning_team_name, total_rounds, game_date)
                VALUES (:demo_filename, :map_name, :team_a_score, :team_b_score, :winning_team_name, :total_rounds, :game_date)
            `, {
                replacements: matchData,
                transaction: t
            });

            const matchId = matchResult;

            // Process Players
            for (const player of playersData) {
                // Insert into player_stats
                await sequelize.query(`
                    INSERT INTO player_stats (
                        match_id, player_name, player_steamid, team_name, is_winner, 
                        kills, deaths, assists, adr, hs_percent,
                        kd, kpr, hs, \`5k\`, \`4k\`, \`3k\`, \`2k\`, MVP
                    )
                    VALUES (
                        :match_id, :player_name, :player_steamid, :team_name, :is_winner, 
                        :kills, :deaths, :assists, :adr, :hs_percent,
                        :kd, :kpr, :hs, :five_k, :four_k, :three_k, :two_k, :MVP
                    )
                `, {
                    replacements: {
                        ...player,
                        match_id: matchId,
                        five_k: player['5k'],
                        four_k: player['4k'],
                        three_k: player['3k'],
                        two_k: player['2k']
                    },
                    transaction: t
                });

                // Update player_summary (Upsert)
                await sequelize.query(`
                    INSERT INTO player_summary (
                        player_steamid, player_name, total_matches, wins, losses,
                        win_rate, total_kills, total_deaths, total_assists,
                        total_hs, k_d_ratio, avg_kpr, avg_adr, avg_hs_percent,
                        total_5k, total_4k, total_3k, total_2k, total_MVP,
                        rating, last_updated
                    )
                    VALUES (
                        :player_steamid, :player_name, 1, :is_winner, 
                        CASE WHEN :is_winner = 1 THEN 0 ELSE 1 END,
                        CASE WHEN :is_winner = 1 THEN 100 ELSE 0 END,
                        :kills, :deaths, :assists, :hs, :kd, :kpr, :adr, :hs_percent,
                        :five_k, :four_k, :three_k, :two_k, :MVP,
                        (CASE WHEN :is_winner = 1 THEN 100 ELSE 0 END * 5) + ((CASE WHEN :deaths > 0 THEN :kills / :deaths ELSE :kills END) * 500) + 5,
                        NOW()
                    )
                    ON DUPLICATE KEY UPDATE
                        player_name = VALUES(player_name),
                        total_matches = total_matches + 1,
                        wins = wins + VALUES(wins),
                        losses = losses + VALUES(losses),
                        win_rate = (wins / total_matches) * 100,
                        total_kills = total_kills + VALUES(total_kills),
                        total_deaths = total_deaths + VALUES(total_deaths),
                        total_assists = total_assists + VALUES(total_assists),
                        total_hs = total_hs + VALUES(total_hs),
                        k_d_ratio = CASE WHEN total_deaths > 0 THEN total_kills / total_deaths ELSE total_kills END,
                        avg_kpr = ((avg_kpr * (total_matches - 1)) + VALUES(avg_kpr)) / total_matches,
                        avg_adr = ((avg_adr * (total_matches - 1)) + VALUES(avg_adr)) / total_matches,
                        avg_hs_percent = ((avg_hs_percent * (total_matches - 1)) + VALUES(avg_hs_percent)) / total_matches,
                        total_5k = total_5k + VALUES(total_5k),
                        total_4k = total_4k + VALUES(total_4k),
                        total_3k = total_3k + VALUES(total_3k),
                        total_2k = total_2k + VALUES(total_2k),
                        total_MVP = total_MVP + VALUES(total_MVP),
                        rating = (win_rate * 5) + (k_d_ratio * 500) + (total_matches * 5),
                        last_updated = NOW();
                `, {
                    replacements: {
                        ...player,
                        five_k: player['5k'],
                        four_k: player['4k'],
                        three_k: player['3k'],
                        two_k: player['2k']
                    },
                    transaction: t
                });
            }

            await t.commit();
            return matchId;

        } catch (error) {
            await t.rollback();
            logger.error('Error processing match stats:', error);
            throw error;
        }
    }
}

module.exports = new MatchService();
