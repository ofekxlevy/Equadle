import { useEffect, useState } from 'react';

import './Game.css';
import { getRandomEquation } from '../game/equations';
import { createGame, submitGuess } from '../game/gameState';
import {
    ALLOWED_TOKENS,
    EQUATION_LENGTH,
} from '../game/types';
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

    function handleNewGame() {
        setGameState(
            createGame(getRandomEquation())
        );

        setCurrentGuess([]);
        setErrorMessage('');
    }

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (gameState.status !== 'playing') {
                return;
            }

            if (event.key === 'Backspace') {
                event.preventDefault();
                handleDelete();
                return;
            }

            if (event.key === 'Enter') {
                event.preventDefault();
                handleSubmit();
                return;
            }

            if (event.key === '^') {
                event.preventDefault();
                handleTokenClick('^2');
                return;
            }

            const token = event.key as Token;

            if (ALLOWED_TOKENS.includes(token)) {
                event.preventDefault();
                handleTokenClick(token);
            }
        }

        window.addEventListener(
            'keydown',
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [gameState, currentGuess]);

    return (
        <div>
            <h1>Equadle</h1>

            <Board
                guesses={gameState.guesses}
                currentGuess={currentGuess}
                status={gameState.status}
            />

            {gameState.status === 'won' && (
                <p>You won!</p>
            )}

            {gameState.status === 'lost' && (
                <p>
                    The equation was: {gameState.secret.join('')}
                </p>
            )}

            {errorMessage && <p>{errorMessage}</p>}

            {gameState.status === 'playing' && (
                <Keyboard
                    guesses={gameState.guesses}
                    onTokenClick={handleTokenClick}
                    onDelete={handleDelete}
                    onSubmit={handleSubmit}
                />
            )}

            {gameState.status !== 'playing' && (
                <button
                    className="new-game-button"
                    onClick={handleNewGame}
                >
                    New Game
                </button>
            )}
        </div>
    );
}