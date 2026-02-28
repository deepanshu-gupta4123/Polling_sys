import express from 'express';
import Poll from '../models/Poll.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new poll
router.post('/polls', protect, async (req, res) => {
    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        const pollId = Math.random().toString(36).substr(2, 9);
        const poll = await Poll.create({
            pollId,
            title,
            description,
            teacherId: req.user._id,
            isActive: true
        });

        res.json({ success: true, poll });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get poll details
router.get('/polls/:pollId', async (req, res) => {
    const { pollId } = req.params;

    try {
        const poll = await Poll.findOne({ pollId });

        if (!poll) {
            return res.status(404).json({ error: 'Poll not found' });
        }

        res.json({ success: true, poll });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get poll results
router.get('/polls/:pollId/results', async (req, res) => {
    const { pollId } = req.params;

    try {
        const poll = await Poll.findOne({ pollId });

        if (!poll) {
            return res.status(404).json({ error: 'Poll not found' });
        }

        // Return questions which contain options and votes
        res.json({ success: true, results: { questions: poll.questions } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;

