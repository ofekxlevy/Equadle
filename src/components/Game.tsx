import { useState } from 'react';

import { getRandomEquation } from '../game/equations';
import { createGame, submitGuess } from '../game/gameState';
import { EQUATION_LENGTH } from '../game/types';
import type { Token } from '../game/types';
import { Board } from './Board';
import { Keyboard } from './Keyboard';

export function Game() {
    const [gameState, setGameState] = useState(() =>
        createGame(getRandomEquation())
    );

    const [currentGuess, setCurrentGuess] = useState<Token[]>([]);
    const [errorMessage, setErrorMessage] = useState('');

    function handleTokenClick(token: Token) {
        setCurrentGuess((guess) => {
            if (guess.length >= EQUATION_LENGTH) {
                return guess;
            }

            return [
                ...guess,
                token,
            ];
        });
    }

    function handleDelete() {
        setCurrentGuess((guess) =>
            guess.slice(0, -1)
        );
    }

    function handleSubmit() {
        const result = submitGuess(
            gameState,
            currentGuess
        );

        if (result.isValid) {
            setGameState(result.state);
            setCurrentGuess([]);
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
                currentGuess={currentGuess}
            />

            <p>Status: {gameState.status}</p>

            {errorMessage && <p>{errorMessage}</p>}

            <Keyboard
                guesses={gameState.guesses}
                onTokenClick={handleTokenClick}
                onDelete={handleDelete}
                onSubmit={handleSubmit}
            />
        </div>
    );
}