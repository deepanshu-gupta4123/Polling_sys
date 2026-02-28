import { nanoid } from 'nanoid';

class PollStore {
  constructor() {
    this.polls = new Map();
    this.participants = new Map(); // socketId -> participant info
    this.questionTimers = new Map(); // questionId -> timer reference
  }

  createPoll(title, description = '') {
    const pollId = nanoid(10);
    const poll = {
      id: pollId,
      title,
      description,
      createdAt: new Date().toISOString(),
      isActive: true,
      questions: [],
      currentQuestionId: null
    };

    this.polls.set(pollId, poll);
    return poll;
  }

  getPoll(pollId) {
    return this.polls.get(pollId);
  }

  addQuestion(pollId, questionData) {
    const poll = this.polls.get(pollId);
    if (!poll) return null;

    const questionId = nanoid(10);
    const question = {
      id: questionId,
      pollId,
      text: questionData.text,
      options: questionData.options.map((opt, idx) => ({
        id: opt.id,
        text: opt.text,
        isCorrect: opt.id === questionData.correctOptionId
      })),
      correctOptionId: questionData.correctOptionId,
      timeLimitSeconds: questionData.timeLimitSeconds || 60,
      status: 'pending', // pending | active | closed
      createdAt: new Date().toISOString(),
      votes: {}, // optionId -> count
      answeredBy: new Set() // student socket IDs
    };

    // Initialize vote counts
    question.options.forEach(opt => {
      question.votes[opt.id] = 0;
    });

    poll.questions.push(question);
    return question;
  }

  startQuestion(pollId, questionId) {
    const poll = this.polls.get(pollId);
    if (!poll) return null;

    const question = poll.questions.find(q => q.id === questionId);
    if (!question || question.status !== 'pending') return null;

    question.status = 'active';
    question.startedAt = new Date().toISOString();
    poll.currentQuestionId = questionId;

    return question;
  }

  closeQuestion(pollId, questionId) {
    const poll = this.polls.get(pollId);
    if (!poll) return null;

    const question = poll.questions.find(q => q.id === questionId);
    if (!question) return null;

    question.status = 'closed';
    question.closedAt = new Date().toISOString();

    if (poll.currentQuestionId === questionId) {
      poll.currentQuestionId = null;
    }

    // Clear timer if exists
    if (this.questionTimers.has(questionId)) {
      clearTimeout(this.questionTimers.get(questionId));
      this.questionTimers.delete(questionId);
    }

    return question;
  }

  recordVote(pollId, questionId, studentSocketId, optionId) {
    const poll = this.polls.get(pollId);
    if (!poll) return null;

    const question = poll.questions.find(q => q.id === questionId);
    if (!question || question.status !== 'active') return null;

    // Check if student already answered
    if (question.answeredBy.has(studentSocketId)) {
      return null;
    }

    // Record vote
    if (question.votes[optionId] !== undefined) {
      question.votes[optionId]++;
      question.answeredBy.add(studentSocketId);
      return question;
    }

    return null;
  }

  addParticipant(socketId, pollId, name, role = 'student') {
    const participant = {
      socketId,
      pollId,
      name,
      role,
      joinedAt: new Date().toISOString(),
      isRemoved: false
    };

    this.participants.set(socketId, participant);
    return participant;
  }

  removeParticipant(socketId) {
    const participant = this.participants.get(socketId);
    if (participant) {
      participant.isRemoved = true;
    }
    this.participants.delete(socketId);
    return participant;
  }

  getParticipant(socketId) {
    return this.participants.get(socketId);
  }

  getActivePollParticipants(pollId) {
    return Array.from(this.participants.values())
      .filter(p => p.pollId === pollId && !p.isRemoved && p.role === 'student');
  }

  getCurrentQuestion(pollId) {
    const poll = this.polls.get(pollId);
    if (!poll || !poll.currentQuestionId) return null;

    return poll.questions.find(q => q.id === poll.currentQuestionId);
  }

  canStartNewQuestion(pollId) {
    const poll = this.polls.get(pollId);
    if (!poll) return false;

    // Can start if no current question
    if (!poll.currentQuestionId) return true;

    const currentQ = this.getCurrentQuestion(pollId);
    // Can start if current question is closed
    return !currentQ || currentQ.status === 'closed';
  }

  getResults(pollId) {
    const poll = this.polls.get(pollId);
    if (!poll) return null;

    return {
      pollId: poll.id,
      title: poll.title,
      questions: poll.questions.map(q => ({
        id: q.id,
        text: q.text,
        status: q.status,
        options: q.options.map(opt => ({
          id: opt.id,
          text: opt.text,
          votes: q.votes[opt.id] || 0,
          percentage: Object.values(q.votes).reduce((sum, v) => sum + v, 0) > 0
            ? Math.round((q.votes[opt.id] / Object.values(q.votes).reduce((sum, v) => sum + v, 0)) * 100)
            : 0
        })),
        totalVotes: Object.values(q.votes).reduce((sum, v) => sum + v, 0),
        answeredCount: q.answeredBy.size,
        correctOptionId: q.options.find(o => o.isCorrect)?.id // Assuming isCorrect is stored, but it wasn't in addQuestion. Let's fix addQuestion too.
      }))
    };
  }

  setQuestionTimer(questionId, timer) {
    this.questionTimers.set(questionId, timer);
  }

  clearQuestionTimer(questionId) {
    if (this.questionTimers.has(questionId)) {
      clearTimeout(this.questionTimers.get(questionId));
      this.questionTimers.delete(questionId);
    }
  }

  removePoll(pollId) {
    const poll = this.polls.get(pollId);
    if (!poll) return;

    // Clear all question timers
    poll.questions.forEach(q => {
      if (this.questionTimers.has(q.id)) {
        clearTimeout(this.questionTimers.get(q.id));
        this.questionTimers.delete(q.id);
      }
    });

    // Remove all participants associated with this poll
    for (const [socketId, participant] of this.participants.entries()) {
      if (participant.pollId === pollId) {
        this.participants.delete(socketId);
      }
    }

    // Remove the poll
    this.polls.delete(pollId);
    console.log(`Poll ${pollId} removed completely`);
  }
}

export default new PollStore();
