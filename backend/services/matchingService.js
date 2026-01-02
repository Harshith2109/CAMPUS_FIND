const Item = require('../models/Item');
const notificationService = require('./notificationService');
const User = require('../models/User');

/**
 * Calculate match score between two items
 * @param {Object} item1 - First item (lost or found)
 * @param {Object} item2 - Second item (opposite type)
 * @returns {Number} - Match score (0-100)
 */
const calculateMatchScore = (item1, item2) => {
    let score = 0;

    // Category match (required - 40 points)
    if (item1.category === item2.category) {
        score += 40;
    } else {
        return 0; // No match if categories don't match
    }

    // Date proximity (up to 20 points)
    const date1 = new Date(item1.date);
    const date2 = new Date(item2.date);
    const daysDiff = Math.abs((date1 - date2) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 1) {
        score += 20;
    } else if (daysDiff <= 3) {
        score += 15;
    } else if (daysDiff <= 7) {
        score += 10;
    } else if (daysDiff <= 14) {
        score += 5;
    }

    // Location similarity (up to 20 points)
    const location1 = item1.location.toLowerCase();
    const location2 = item2.location.toLowerCase();

    if (location1 === location2) {
        score += 20;
    } else if (location1.includes(location2) || location2.includes(location1)) {
        score += 10;
    }

    // Color match (10 points)
    if (item1.color && item2.color) {
        const color1 = item1.color.toLowerCase();
        const color2 = item2.color.toLowerCase();
        if (color1 === color2 || color1.includes(color2) || color2.includes(color1)) {
            score += 10;
        }
    }

    // Brand match (10 points)
    if (item1.brand && item2.brand) {
        const brand1 = item1.brand.toLowerCase();
        const brand2 = item2.brand.toLowerCase();
        if (brand1 === brand2 || brand1.includes(brand2) || brand2.includes(brand1)) {
            score += 10;
        }
    }

    // Description keyword matching (up to 10 points)
    const desc1Words = item1.description.toLowerCase().split(/\s+/);
    const desc2Words = item2.description.toLowerCase().split(/\s+/);
    const commonWords = desc1Words.filter(word =>
        word.length > 3 && desc2Words.includes(word)
    );

    if (commonWords.length > 0) {
        score += Math.min(10, commonWords.length * 2);
    }

    return Math.min(100, score);
};

/**
 * Find potential matches for an item
 * @param {Object} item - The item to find matches for
 * @returns {Array} - Array of matched items with scores
 */
exports.findMatches = async (item) => {
    try {
        // Find items of opposite type with same category
        const oppositeType = item.type === 'lost' ? 'found' : 'lost';

        const potentialMatches = await Item.find({
            type: oppositeType,
            category: item.category,
            status: 'active',
            _id: { $ne: item._id }
        }).populate('reportedBy', 'name email');

        // Calculate match scores
        const matches = potentialMatches.map(matchItem => ({
            item: matchItem,
            score: calculateMatchScore(item, matchItem)
        }));

        // Filter matches with score >= 40 (minimum threshold)
        const validMatches = matches.filter(match => match.score >= 40);

        // Sort by score (highest first)
        validMatches.sort((a, b) => b.score - a.score);

        return validMatches;
    } catch (error) {
        console.error('Error finding matches:', error);
        throw error;
    }
};

/**
 * Update matched items for a newly created item
 * @param {Object} newItem - The newly created item
 */
exports.updateMatches = async (newItem) => {
    try {
        const matches = await this.findMatches(newItem);

        if (matches.length > 0) {
            // Update the new item's matchedItems array
            const matchedItemIds = matches.map(m => m.item._id);
            newItem.matchedItems = matchedItemIds;
            await newItem.save();

            // Update each matched item to include the new item
            for (const match of matches) {
                const matchedItem = match.item;

                if (!matchedItem.matchedItems.includes(newItem._id)) {
                    matchedItem.matchedItems.push(newItem._id);
                    await matchedItem.save();
                }

                // Notify the user who reported the matched item
                const matchedUser = await User.findById(matchedItem.reportedBy);
                if (matchedUser) {
                    await notificationService.notifyMatch(matchedUser, matchedItem, newItem);
                }
            }

            // Notify the user who reported the new item
            const newItemUser = await User.findById(newItem.reportedBy);
            if (newItemUser && matches.length > 0) {
                // Notify about the best match
                await notificationService.notifyMatch(newItemUser, newItem, matches[0].item);
            }

            console.log(`✅ Found ${matches.length} matches for item: ${newItem.title}`);
        }

        return matches;
    } catch (error) {
        console.error('Error updating matches:', error);
        throw error;
    }
};

/**
 * Get match quality label
 * @param {Number} score - Match score
 * @returns {String} - Quality label
 */
exports.getMatchQuality = (score) => {
    if (score >= 80) return 'High';
    if (score >= 60) return 'Medium';
    if (score >= 40) return 'Low';
    return 'No Match';
};

/**
 * Re-run matching for all active items (admin function)
 */
exports.reMatchAllItems = async () => {
    try {
        const activeItems = await Item.find({ status: 'active' });

        let totalMatches = 0;
        for (const item of activeItems) {
            const matches = await this.updateMatches(item);
            totalMatches += matches.length;
        }

        console.log(`✅ Re-matched all items. Total matches: ${totalMatches}`);
        return { success: true, totalMatches };
    } catch (error) {
        console.error('Error re-matching items:', error);
        throw error;
    }
};
