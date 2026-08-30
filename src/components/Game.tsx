import { useState } from 'react';

import { getRandomEquation } from '../game/equations';
import { createGame, submitGuess } from '../game/gameState';
import type { Token } from '../game/types';
import { Board } from './Board';

function stringToTokens(input: string): Token[] {
    const tokens: Token[] = [];
    let index = 0;

    while (index < input.length) {
        if (input.slice(index, index + 2) === '^2') {
            tokens.push('^2');
            index += 2;
        } else {
            tokens.push(input[index] as Token);
            index++;
        }
    }

    return tokens;
}

export function Game() {
    const [gameState, setGameState] = useState(() =>
        createGame(getRandomEquation())
    );

    const [currentGuess, setCurrentGuess] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    function handleSubmit() {
        const guess = stringToTokens(currentGuess);
        const result = submitGuess(gameState, guess);

        if (result.isValid) {
            setGameState(result.state);
            setCurrentGuess('');
            setErrorMessage('');
        } else {
            setErrorMessage(result.reason);
        }
    }

    return (
        <div>
            <h1>Equadle</h1>

            <Board
                guesses={gameState.guesses}
                currentGuess={stringToTokens(currentGuess)}
            />
            <p>Status: {gameState.status}</p>
            <p>Current guess: {currentGuess}</p>

            {errorMessage && <p>{errorMessage}</p>}

            <input
                value={currentGuess}
                onChange={(event) => setCurrentGuess(event.target.value)}
            />

            <button onClick={handleSubmit}>
                Submit
            </button>
        </div>
    );
}