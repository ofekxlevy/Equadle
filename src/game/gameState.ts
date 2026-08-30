/**
 * Game state management for Equadle.
 *
 * This file is responsible for representing the current state of a game and
 * applying a submitted guess to that state.
 *
 * The game state contains:
 *
 * - the secret equation the player is trying to discover;
 * - all previously evaluated guesses;
 * - the current game status: playing, won, or lost.
 *
 * The main public functions are:
 *
 * - createGame: creates a fresh game state for a given secret equation;
 * - submitGuess: validates a guess, evaluates its tile states, stores it, and
 *   updates the game status.
 *
 * The implementation does not mutate the existing GameState. Instead, every
 * successful submission returns a new GameState value.
 */

import type { GameStatus, Tile, Token } from './types';
import { validateEquation } from './validateEquation';
import { evaluateGuess } from './evaluateGuess';

const MAX_GUESSES = 6;

/**
 * Represents the complete logical state of one Equadle game.
 *
 * secret  - the equation the player must discover.
 * guesses - all evaluated guesses submitted so far.
 * status  - whether the game is playing, won, or lost.
 */
export type GameState = {
    secret: Token[];
    guesses: Tile[][];
    status: GameStatus;
};

/**
 * Represents the result of attempting to submit a guess.
 *
 * If the guess is accepted, the result contains the updated game state.
 * If the guess is rejected, the result contains the reason.
 */
export type SubmitGuessResult =
    | { isValid: true; state: GameState }
    | { isValid: false; reason: string };


/**
 * Creates a new game using the provided secret equation.
 *
 * A new game starts with:
 * - no previous guesses;
 * - status 'playing'.
 */
export function createGame(secret: Token[]): GameState {
    return {
        secret,
        guesses: [],
        status: 'playing',
    };
}

/**
 * Applies a player's guess to the current game state.
 *
 * The function performs the following steps:
 *
 * 1. Checks that the game is still active.
 * 2. Validates the guessed equation.
 * 3. Compares the guess with the secret equation.
 * 4. Adds the evaluated guess to the guess history.
 * 5. Checks whether the player won.
 * 6. Checks whether the player used all allowed guesses.
 * 7. Returns a new updated GameState.
 *
 * The original state is not modified.
 */
export function submitGuess(state: GameState, guess: Token[]): SubmitGuessResult {
    
    // Check game status
    if (state.status !== 'playing') {
        return {
            isValid: false,
            reason: 'Game is already finished.',
        };
    }

    // Validate guess
    const validationResult = validateEquation(guess);
    if (!validationResult.isValid) {
        return validationResult;
    }

    // Evaluate guess
    const evaluatedGuess = evaluateGuess(state.secret, guess);

    // Add guess to history
    const guesses = [
        ...state.guesses,
        evaluatedGuess,
    ];

    // Check win condition
    const hasWon = guess.every(
        (token, index) => token === state.secret[index]
    );

    // Determine next game status
    const status: GameStatus = hasWon
        ? 'won'
        : guesses.length >= MAX_GUESSES
            ? 'lost'
            : 'playing';

    // Create updated state
    return {
        isValid: true,
        state: {
            ...state,
            guesses,
            status,
        },
    };
}