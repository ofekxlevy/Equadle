import type { Tile, Token } from './types';

/**
 * Compares a guessed equation with the secret equation and returns
 * the tile state for each token in the guess.
 *
 * Matching is done in two passes:
 * 1. Mark all exact matches as 'correct'.
 * 2. Mark remaining matches as 'present' only if an unused matching
 *    token still exists in the secret.
 */
export function evaluateGuess(secret: Token[], guess: Token[]): Tile[] {

    // Initialize result 

    const tiles: Tile[] = guess.map((token) => ({
        value: token,
        state: 'absent',
    }));

    const usedSecretTokens: boolean[] =
        secret.map(() => false);


    // First pass: correct tokens 

    guess.forEach((token, index) => {
        if (secret[index] === token) {
            tiles[index].state = 'correct';
            usedSecretTokens[index] = true;
        }
    });


    // Second pass: present tokens 

    guess.forEach((token, guessIndex) => {

        if (tiles[guessIndex].state === 'correct')
            return;

        const matchingSecretIndex = secret.findIndex(
            (secretToken, secretIndex) =>
                secretToken === token &&
                !usedSecretTokens[secretIndex]
        );

        if (matchingSecretIndex !== -1) {
            tiles[guessIndex].state = 'present';
            usedSecretTokens[matchingSecretIndex] = true;
        }
    });

    return tiles;
}