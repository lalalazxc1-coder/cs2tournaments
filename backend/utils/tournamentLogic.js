const { TournamentBracket } = require('../models');

async function propagateWinner(match, allMatches, format) {
    if (!match.winner_id && match.status === 'completed') {
        // Double Bye case, propagate "Bye" (null winner)
        // But we need to be careful. If we propagate null, the next match sees a Bye.
        // Let's continue.
    }

    // --- UPPER BRACKET PROPAGATION ---
    if (match.group === 'upper') {
        // 1. Send Winner to Next Upper Round
        const nextRound = match.round + 1;
        const nextMatchNumber = Math.ceil(match.match_number / 2);
        const isTeam1InNext = match.match_number % 2 !== 0;

        // Find next match in upper bracket (or Final if it's the last upper round)
        let nextMatch = allMatches.find(m => m.round === nextRound && m.group === 'upper' && m.match_number === nextMatchNumber);

        // If no next upper match, check if it's the Grand Final (for Double Elimination)
        if (!nextMatch && format === 'double_elimination') {
            nextMatch = allMatches.find(m => m.group === 'final');
            // In Grand Final, Winner of Upper Bracket is usually Team 1
            if (nextMatch) {
                nextMatch.team1_id = match.winner_id;
                await nextMatch.save();
                await checkAutoWin(nextMatch, allMatches, format);
            }
        } else if (nextMatch) {
            if (isTeam1InNext) {
                nextMatch.team1_id = match.winner_id;
            } else {
                nextMatch.team2_id = match.winner_id;
            }
            await nextMatch.save();
            await checkAutoWin(nextMatch, allMatches, format);
        }

        // 2. Send Loser to Lower Bracket (Double Elimination Only)
        if (format === 'double_elimination') {
            const loserId = match.winner_id === match.team1_id ? match.team2_id : match.team1_id;
            // Even if loserId is null (Bye), we must call dropToLowerBracket to trigger auto-win checks
            await dropToLowerBracket(match, loserId, allMatches);
        }
    }

    // --- LOWER BRACKET PROPAGATION ---
    else if (match.group === 'lower') {
        const nextRound = match.round + 1;

        const isOddRound = match.round % 2 !== 0;
        let nextMatchNumber, isTeam1InNext;

        if (isOddRound) {
            // Direct
            nextMatchNumber = match.match_number;
            isTeam1InNext = true;
        } else {
            // Merge
            nextMatchNumber = Math.ceil(match.match_number / 2);
            isTeam1InNext = match.match_number % 2 !== 0;
        }

        let nextMatch = allMatches.find(m => m.round === nextRound && m.group === 'lower' && m.match_number === nextMatchNumber);

        // Check if next is Grand Final
        if (!nextMatch) {
            nextMatch = allMatches.find(m => m.group === 'final');
            if (nextMatch) {
                // Winner of Lower Bracket is Team 2 in Grand Final
                nextMatch.team2_id = match.winner_id;
                await nextMatch.save();
                await checkAutoWin(nextMatch, allMatches, format);
            }
        } else {
            if (isTeam1InNext) {
                nextMatch.team1_id = match.winner_id;
            } else {
                nextMatch.team2_id = match.winner_id;
            }
            await nextMatch.save();
            await checkAutoWin(nextMatch, allMatches, format);
        }
    }
}

async function dropToLowerBracket(upperMatch, loserId, allMatches) {
    let targetRound;
    if (upperMatch.round === 1) targetRound = 1;
    else targetRound = (upperMatch.round - 1) * 2;

    let targetMatchNumber;
    let isTeam1; // Which slot?

    if (upperMatch.round === 1) {
        // U1 -> L1 (Merge)
        targetMatchNumber = Math.ceil(upperMatch.match_number / 2);
        isTeam1 = upperMatch.match_number % 2 !== 0;
    } else {
        // U(R) -> L(Target) (Direct)
        targetMatchNumber = upperMatch.match_number;
        isTeam1 = false;
    }

    const targetMatch = allMatches.find(m => m.round === targetRound && m.group === 'lower' && m.match_number === targetMatchNumber);

    if (targetMatch) {
        if (isTeam1) {
            targetMatch.team1_id = loserId;
        } else {
            targetMatch.team2_id = loserId;
        }
        await targetMatch.save();
        await checkAutoWin(targetMatch, allMatches, 'double_elimination');
    }
}

async function checkAutoWin(match, allMatches, format) {
    if (match.status === 'completed') return;

    // Check Slot 1
    let team1Ready = !!match.team1_id;
    let team1Bye = false;
    if (!team1Ready) {
        // Check source
        const source1 = getSourceMatch(match, 1, allMatches);
        if (source1 && source1.status === 'completed') {
            // Check if source produced a candidate
            const candidate = getCandidateFromSource(source1, match, 1);
            if (!candidate) team1Bye = true;
        }
    }

    // Check Slot 2
    let team2Ready = !!match.team2_id;
    let team2Bye = false;
    if (!team2Ready) {
        // Check source
        const source2 = getSourceMatch(match, 2, allMatches);
        if (source2 && source2.status === 'completed') {
            const candidate = getCandidateFromSource(source2, match, 2);
            if (!candidate) team2Bye = true;
        }
    }

    // Logic
    if (team1Ready && team2Ready) {
        match.status = 'scheduled';
        await match.save();
    } else if (team1Ready && team2Bye) {
        console.log(`[AutoWin] Match ${match.id} (R${match.round}) Team 1 (${match.team1_id}) wins due to Bye.`);
        match.winner_id = match.team1_id;
        match.status = 'completed';
        await match.save();
        await propagateWinner(match, allMatches, format);
    } else if (team1Bye && team2Ready) {
        console.log(`[AutoWin] Match ${match.id} (R${match.round}) Team 2 (${match.team2_id}) wins due to Bye.`);
        match.winner_id = match.team2_id;
        match.status = 'completed';
        await match.save();
        await propagateWinner(match, allMatches, format);
    } else if (team1Bye && team2Bye) {
        console.log(`[AutoWin] Match ${match.id} (R${match.round}) Double Bye.`);
        match.winner_id = null;
        match.status = 'completed';
        await match.save();
        await propagateWinner(match, allMatches, format);
    }
}

function getSourceMatch(match, slot, allMatches) {
    if (match.group === 'upper') {
        if (match.round === 1) return null;
        // Slot 1: Match 2M-1. Slot 2: Match 2M.
        const sourceMatchNum = slot === 1 ? (match.match_number * 2 - 1) : (match.match_number * 2);
        return allMatches.find(m => m.group === 'upper' && m.round === match.round - 1 && m.match_number === sourceMatchNum);
    }

    if (match.group === 'lower') {
        if (match.round === 1) {
            // Slot 1: U1 Match 2M-1. Slot 2: U1 Match 2M.
            const sourceMatchNum = slot === 1 ? (match.match_number * 2 - 1) : (match.match_number * 2);
            return allMatches.find(m => m.group === 'upper' && m.round === 1 && m.match_number === sourceMatchNum);
        }

        if (match.round % 2 === 0) {
            // Even Round
            if (slot === 1) {
                // From Lower Odd
                // L(R-1) Match M -> L(R) Match M (Slot 1)
                // Wait, propagateWinner says: L(Odd) Match M -> L(Even) Match M.
                return allMatches.find(m => m.group === 'lower' && m.round === match.round - 1 && m.match_number === match.match_number);
            } else {
                // From Upper
                // U(R/2 + 1) Match M -> L(R) Match M (Slot 2)
                const sourceRound = (match.round / 2) + 1;
                return allMatches.find(m => m.group === 'upper' && m.round === sourceRound && m.match_number === match.match_number);
            }
        } else {
            // Odd Round (>1)
            // Slot 1: L(R-1) Match 2M-1. Slot 2: L(R-1) Match 2M.
            const sourceMatchNum = slot === 1 ? (match.match_number * 2 - 1) : (match.match_number * 2);
            return allMatches.find(m => m.group === 'lower' && m.round === match.round - 1 && m.match_number === sourceMatchNum);
        }
    }

    if (match.group === 'final') {
        if (slot === 1) {
            // Winner of Upper Final
            // Upper Final is the last round of Upper.
            // We need to find the max round of Upper.
            const maxUpperRound = Math.max(...allMatches.filter(m => m.group === 'upper').map(m => m.round));
            return allMatches.find(m => m.group === 'upper' && m.round === maxUpperRound);
        } else {
            // Winner of Lower Final
            const maxLowerRound = Math.max(...allMatches.filter(m => m.group === 'lower').map(m => m.round));
            return allMatches.find(m => m.group === 'lower' && m.round === maxLowerRound);
        }
    }

    return null;
}

function getCandidateFromSource(sourceMatch, targetMatch, targetSlot) {
    // If source is Upper feeding Lower (Loser drops)
    // We need to identify if this specific connection is a "Drop" connection.

    let isDrop = false;
    if (targetMatch.group === 'lower') {
        if (targetMatch.round === 1) isDrop = true; // All L1 sources are drops
        else if (targetMatch.round % 2 === 0 && targetSlot === 2) isDrop = true; // Even Round Slot 2 is drop
    }

    if (isDrop) {
        // Candidate is Loser
        // If source match had a Bye (one team missing), there is NO loser.
        if (!sourceMatch.team1_id || !sourceMatch.team2_id) return null;
        // If both present, loser is the one who didn't win
        if (sourceMatch.winner_id === sourceMatch.team1_id) return sourceMatch.team2_id;
        if (sourceMatch.winner_id === sourceMatch.team2_id) return sourceMatch.team1_id;
        return null; // Should not happen if completed
    } else {
        // Candidate is Winner
        return sourceMatch.winner_id;
    }
}

module.exports = {
    propagateWinner,
    dropToLowerBracket,
    checkAutoWin,
    generateVetoSequence
};

function generateVetoSequence(formatInput, mapPoolSize) {
    const format = (formatInput || 'BO3').toString().toUpperCase().trim();
    const mapsToPlay = format === 'BO5' ? 5 : (format === 'BO3' ? 3 : 1);
    let mapsToBan = mapPoolSize - mapsToPlay;

    // Safety check
    if (mapsToBan < 0) mapsToBan = 0;

    const sequence = [];

    if (format === 'BO1') {
        // All bans until 1 left
        for (let i = 0; i < mapsToBan; i++) sequence.push('ban');
    } else if (format === 'BO3') {
        // Standard: Ban, Ban, Pick, Pick, Ban, Ban...
        // We need 2 picks (decider is leftover).

        // Initial Bans (up to 2)
        const initialBans = Math.min(mapsToBan, 2);
        for (let i = 0; i < initialBans; i++) sequence.push('ban');
        mapsToBan -= initialBans;

        // Picks (2)
        sequence.push('pick', 'pick');

        // Remaining Bans
        for (let i = 0; i < mapsToBan; i++) sequence.push('ban');

    } else if (format === 'BO5') {
        // Standard: Ban, Ban, Pick, Pick, Pick, Pick...
        // We need 4 picks (decider is leftover).

        // Initial Bans (up to 2)
        const initialBans = Math.min(mapsToBan, 2);
        for (let i = 0; i < initialBans; i++) sequence.push('ban');
        mapsToBan -= initialBans;

        // Picks (4)
        sequence.push('pick', 'pick', 'pick', 'pick');

        // Remaining Bans
        for (let i = 0; i < mapsToBan; i++) sequence.push('ban');
    } else {
        // Default to BO1 behavior if unknown format
        for (let i = 0; i < mapsToBan; i++) sequence.push('ban');
    }

    console.log(`[VetoSequence] Format: ${format}, Pool: ${mapPoolSize}, Sequence: ${JSON.stringify(sequence)}`);
    return sequence;
}
