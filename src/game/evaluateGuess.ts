import type { Tile, TileState, Token } from './types';

function getTileState(secret: Token[], token: Token, index: number): TileState {
    if (secret[index] === token) 
        return 'correct';
    if (secret.includes(token)) 
        return 'present';
    return 'absent';
}

/**
 * Compares a guessed equation with the secret equation and returns
 * the tile state for each token in the guess.
 *
 * A tile is marked as:
 * - 'correct' if the token is in the exact same position.
 * - 'present' if the token exists in the secret equation but in another position.
 * - 'absent' if the token does not exist in the secret equation.
 *
 * Note: this simple implementation does not fully handle duplicate tokens yet.
 */
export function evaluateGuess(secret: Token[], guess: Token[]): Tile[] {
    return guess.map((token, index) => ({
        value: token,
        state: getTileState(secret, token, index),
    }));
}