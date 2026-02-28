import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
    id: String,
    text: String,
    votes: {
        type: Number,
        default: 0
    }
});

const questionSchema = new mongoose.Schema({
    id: String,
    text: String,
    options: [optionSchema],
    correctOptionId: String,
    status: {
        type: String,
        enum: ['active', 'closed', 'pending'],
        default: 'pending'
    },
    startTime: Date,
    endTime: Date
});

const pollSchema = new mongoose.Schema({
    pollId: {
        type: String,
        unique: true,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questions: [questionSchema],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Poll = mongoose.model('Poll', pollSchema);

export default Poll;
