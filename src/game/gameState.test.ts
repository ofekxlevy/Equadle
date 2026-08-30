import { describe, expect, it } from 'vitest';
import type { Token } from './types';
import { createGame, submitGuess } from './gameState';

const SECRET: Token[] = [
    '(', '3', '+', '5', ')', '*', '4', '=', '3', '2'
];

const WRONG_GUESS: Token[] = [
    '(', '9', '-', '4', ')', '*', '5', '=', '2', '5'
];

describe('createGame', () => {
    it('creates a new game in playing state with no guesses', () => {
        const state = createGame(SECRET);

        expect(state).toEqual({
            secret: SECRET,
            guesses: [],
            status: 'playing',
        });
    });
});

describe('submitGuess', () => {
    it('adds a valid incorrect guess and keeps the game playing', () => {
        const state = createGame(SECRET);

        const result = submitGuess(state, WRONG_GUESS);

        expect(result.isValid).toBe(true);

        if (result.isValid) {
            expect(result.state.guesses).toHaveLength(1);
            expect(result.state.status).toBe('playing');
        }
    });

    it('sets the game status to won when the guess equals the secret', () => {
        const state = createGame(SECRET);

        const result = submitGuess(state, SECRET);

        expect(result.isValid).toBe(true);

        if (result.isValid) {
            expect(result.state.guesses).toHaveLength(1);
            expect(result.state.status).toBe('won');
        }
    });

    it('sets the game status to lost after six incorrect guesses', () => {
        let state = createGame(SECRET);

        for (let i = 0; i < 6; i++) {
            const result = submitGuess(state, WRONG_GUESS);

            expect(result.isValid).toBe(true);

            if (!result.isValid)
                throw new Error('Expected guess to be valid.');

            state = result.state;
        }

        expect(state.guesses).toHaveLength(6);
        expect(state.status).toBe('lost');
    });

    it('rejects an invalid equation', () => {
        const state = createGame(SECRET);

        const invalidGuess: Token[] = [
            '1', '2', '+', '3', '4', '-', '5', '=', '4'
        ];

        const result = submitGuess(state, invalidGuess);

        expect(result.isValid).toBe(false);
    });

    it('does not mutate the original game state', () => {
        const state = createGame(SECRET);

        submitGuess(state, WRONG_GUESS);

        expect(state.guesses).toEqual([]);
        expect(state.status).toBe('playing');
    });

    it('rejects a guess when the game is already finished', () => {
        const state = {
            ...createGame(SECRET),
            status: 'won' as const,
        };

        const result = submitGuess(state, WRONG_GUESS);

        expect(result).toEqual({
            isValid: false,
            reason: 'Game is already finished.',
        });
    });
});