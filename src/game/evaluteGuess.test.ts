import { describe, expect, it } from 'vitest';
import { evaluateGuess } from './evaluateGuess';
import type { Token } from './types';

describe('evaluateGuess', () => {

    // ===== Correct tokens =====

    it('marks tokens as correct when they are in the correct position', () => {
        const secret: Token[] =
            ['1', '2', '+', '3', '4', '-', '5', '=', '4', '1'];

        const guess: Token[] =
            ['1', '2', '+', '3', '4', '-', '5', '=', '4', '1'];

        const result = evaluateGuess(secret, guess);

        expect(result.every((tile) => tile.state === 'correct')).toBe(true);
    });


    // ===== Present tokens =====

    it('marks a token as present when it exists in another position', () => {
        const secret: Token[] =
            ['1', '2', '+', '3', '4', '-', '5', '=', '4', '1'];

        const guess: Token[] =
            ['2', '1', '+', '3', '4', '-', '5', '=', '4', '1'];

        const result = evaluateGuess(secret, guess);

        expect(result[0]).toEqual({
            value: '2',
            state: 'present',
        });

        expect(result[1]).toEqual({
            value: '1',
            state: 'present',
        });
    });


    // ===== Absent tokens =====

    it('marks a token as absent when it does not exist in the secret', () => {
        const secret: Token[] =
            ['1', '2', '+', '3', '4', '-', '5', '=', '4', '1'];

        const guess: Token[] =
            ['9', '2', '+', '3', '4', '-', '5', '=', '4', '1'];

        const result = evaluateGuess(secret, guess);

        expect(result[0]).toEqual({
            value: '9',
            state: 'absent',
        });
    });


    // ===== Result structure =====

    it('returns one tile for every token in the guess', () => {
        const secret: Token[] =
            ['1', '2', '+', '3', '4', '-', '5', '=', '4', '1'];

        const guess: Token[] =
            ['1', '2', '+', '3', '4', '-', '5', '=', '4', '1'];

        const result = evaluateGuess(secret, guess);

        expect(result).toHaveLength(guess.length);
    });


    // ===== Duplicate tokens =====

    it('does not mark an extra duplicate as present when the secret contains only one occurrence', () => {
        const secret: Token[] =
            ['1', '2', '+', '3', '4', '-', '5', '=', '4', '1'];

        const guess: Token[] =
            ['1', '1', '+', '3', '4', '-', '5', '=', '4', '9'];

        const result = evaluateGuess(secret, guess);

        expect(result[0]).toEqual({
            value: '1',
            state: 'correct',
        });

        expect(result[1]).toEqual({
            value: '1',
            state: 'present',
        });

        expect(result[9]).toEqual({
            value: '9',
            state: 'absent',
        });
    });


    it('marks an unmatched duplicate as absent after all matching occurrences are used', () => {
        const secret: Token[] =
            ['1', '2', '+', '3', '4', '-', '5', '=', '6', '7'];

        const guess: Token[] =
            ['1', '1', '+', '3', '4', '-', '5', '=', '6', '7'];

        const result = evaluateGuess(secret, guess);

        expect(result[0]).toEqual({
            value: '1',
            state: 'correct',
        });

        expect(result[1]).toEqual({
            value: '1',
            state: 'absent',
        });
    });

    it('handles more than two occurrences of the same token correctly', () => {
        const secret: Token[] =
            ['1', '2', '1', '3', '1', '=', '4', '5', '6', '7'];

        const guess: Token[] =
            ['1', '1', '1', '1', '8', '=', '4', '5', '6', '7'];

        const result = evaluateGuess(secret, guess);

        expect(result[0]).toEqual({
            value: '1',
            state: 'correct',
        });

        expect(result[1]).toEqual({
            value: '1',
            state: 'present',
        });

        expect(result[2]).toEqual({
            value: '1',
            state: 'correct',
        });

        expect(result[3]).toEqual({
            value: '1',
            state: 'absent',
        });
    });


    it('gives correct matches priority over present matches', () => {
        const secret: Token[] =
            ['1', '2', '+', '3', '4', '-', '5', '=', '6', '7'];

        const guess: Token[] =
            ['2', '2', '+', '3', '4', '-', '5', '=', '6', '7'];

        const result = evaluateGuess(secret, guess);

        expect(result[0]).toEqual({
            value: '2',
            state: 'absent',
        });

        expect(result[1]).toEqual({
            value: '2',
            state: 'correct',
        });
    });

});