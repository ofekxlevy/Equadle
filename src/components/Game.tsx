import { useEffect, useRef, useState } from 'react';

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

    const gameStateRef = useRef(gameState);
    const currentGuessRef = useRef(currentGuess);

    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    useEffect(() => {
        currentGuessRef.current = currentGuess;
    }, [currentGuess]);

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
            if (gameStateRef.current.status !== 'playing') {
                return;
            }

            if (event.key === 'Backspace') {
                event.preventDefault();

                setCurrentGuess((guess) =>
                    guess.slice(0, -1)
                );

                return;
            }

            if (event.key === 'Enter') {
                event.preventDefault();

                const result = submitGuess(
                    gameStateRef.current,
                    currentGuessRef.current
                );

                if (result.isValid) {
                    setGameState(result.state);
                    setCurrentGuess([]);
                    setErrorMessage('');
                } else {
                    setErrorMessage(result.reason);
                }

                return;
            }

            if (event.key === '^') {
                event.preventDefault();

                setCurrentGuess((guess) => {
                    if (guess.length >= EQUATION_LENGTH) {
                        return guess;
                    }

                    return [
                        ...guess,
                        '^2',
                    ];
                });

                return;
            }

            const token = event.key as Token;

            if (ALLOWED_TOKENS.includes(token)) {
                event.preventDefault();

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
    }, []);

    return (
        <div className="game">
            <h1 className="game-title">
                Equadle
            </h1>

            <Board
                guesses={gameState.guesses}
                currentGuess={currentGuess}
                status={gameState.status}
            />

            {gameState.status === 'won' && (
                <p className="game-message game-message-success">
                    You won!
                </p>
            )}

            {gameState.status === 'lost' && (
                <p className="game-message game-message-loss">
                    The equation was: {gameState.secret.join('')}
                </p>
            )}

            {errorMessage && (
                <p className="game-error">
                    {errorMessage}
                </p>
            )}

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