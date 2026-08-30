import './Keyboard.css';
import { ALLOWED_TOKENS } from '../game/types';
import type { Tile, TileState, Token } from '../game/types';

type KeyboardProps = {
    guesses: Tile[][];
    onTokenClick: (token: Token) => void;
    onDelete: () => void;
    onSubmit: () => void;
};

const STATE_PRIORITY: Record<
    Exclude<TileState, 'empty'>,
    number
> = {
    absent: 1,
    present: 2,
    correct: 3,
};

function getBestTileState(
    guesses: Tile[][],
    token: Token
): Exclude<TileState, 'empty'> | undefined {
    let bestState:
        | Exclude<TileState, 'empty'>
        | undefined;

    guesses.forEach((guess) => {
        guess.forEach((tile) => {
            if (
                tile.value !== token ||
                tile.state === 'empty'
            ) {
                return;
            }

            if (
                bestState === undefined ||
                STATE_PRIORITY[tile.state] >
                    STATE_PRIORITY[bestState]
            ) {
                bestState = tile.state;
            }
        });
    });

    return bestState;
}

export function Keyboard({
    guesses,
    onTokenClick,
    onDelete,
    onSubmit,
}: KeyboardProps) {
    return (
        <div className="keyboard">
            {ALLOWED_TOKENS.map((token) => {
                const state =
                    getBestTileState(guesses, token);

                return (
                    <button
                        key={token}
                        className={
                            state
                                ? `keyboard-key keyboard-key-${state}`
                                : 'keyboard-key'
                        }
                        onClick={() => onTokenClick(token)}
                    >
                        {token}
                    </button>
                );
            })}

            <button
                className="keyboard-key"
                onClick={onDelete}
            >
                ⌫
            </button>

            <button
                className="keyboard-key"
                onClick={onSubmit}
            >
                Enter
            </button>
        </div>
    );
}