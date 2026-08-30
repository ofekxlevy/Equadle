import type { GameStatus, Tile, Token } from './types';
import { validateEquation } from './validateEquation';
import { evaluateGuess } from './evaluateGuess';

const MAX_GUESSES = 6;

export type GameState = {
    secret: Token[];
    guesses: Tile[][];
    status: GameStatus;
};

export type SubmitGuessResult =
    | { isValid: true; state: GameState }
    | { isValid: false; reason: string };


export function createGame(secret: Token[]): GameState {
    return {
        secret,
        guesses: [],
        status: 'playing',
    };
}



export function submitGuess(state: GameState, guess: Token[]): SubmitGuessResult {
    if (state.status !== 'playing') {
        return {
            isValid: false,
            reason: 'Game is already finished.',
        };
    }

    const validationResult = validateEquation(guess);
    if (!validationResult.isValid) {
        return validationResult;
    }

    const evaluatedGuess = evaluateGuess(state.secret, guess);

    const guesses = [
        ...state.guesses,
        evaluatedGuess,
    ];

    const hasWon = guess.every(
        (token, index) => token === state.secret[index]
    );

    const status: GameStatus = hasWon
        ? 'won'
        : guesses.length >= MAX_GUESSES
            ? 'lost'
            : 'playing';

    return {
        isValid: true,
        state: {
            ...state,
            guesses,
            status,
        },
    };
}