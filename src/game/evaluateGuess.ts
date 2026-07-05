import type { Tile, TileState } from './types';

function getTileState(secret: string, char: string, index: number): TileState {
    if (secret[index] === char) 
        return 'correct';
    else if (secret.includes(char)) 
        return 'present';
    else 
        return 'absent';
}

/**
 * Compares a guessed equation with the secret equation and returns
 * the tile state for each character in the guess.
 *
 * A tile is marked as:
 * - 'correct' if the character is in the exact same position.
 * - 'present' if the character exists in the secret equation but in another position.
 * - 'absent' if the character does not exist in the secret equation.
 *
 * Note: this simple implementation does not fully handle duplicate characters yet.
 */
export function evaluateGuess(secret: string, guess: string): Tile[] {
    return guess.split('').map((char, index) => ({
        value: char,
        state: getTileState(secret, char, index),
    }));
}