import './Keyboard.css';
import type { Tile, TileState, Token } from '../game/types';

type KeyboardProps = {
    guesses: Tile[][];
    onTokenClick: (token: Token) => void;
    onDelete: () => void;
    onSubmit: () => void;
};

const DIGIT_KEYS: Token[] = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
];

const OPERATOR_KEYS: Token[] = [
    '+',
    '-',
    '*',
    '/',
    '^2',
    '(',
    ')',
    '=',
];

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

function renderTokenKey(
    token: Token,
    guesses: Tile[][],
    onTokenClick: (token: Token) => void
) {
    const state = getBestTileState(guesses, token);

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
}

export function Keyboard({
    guesses,
    onTokenClick,
    onDelete,
    onSubmit,
}: KeyboardProps) {
    return (
        <div className="keyboard">
            <div className="keyboard-row">
                {DIGIT_KEYS.map((token) =>
                    renderTokenKey(
                        token,
                        guesses,
                        onTokenClick
                    )
                )}
            </div>

            <div className="keyboard-row">
                {OPERATOR_KEYS.map((token) =>
                    renderTokenKey(
                        token,
                        guesses,
                        onTokenClick
                    )
                )}
            </div>

            <div className="keyboard-row">
                <button
                    className="keyboard-key keyboard-action-key"
                    onClick={onDelete}
                >
                    ⌫
                </button>

                <button
                    className="keyboard-key keyboard-action-key"
                    onClick={onSubmit}
                >
                    Enter
                </button>
            </div>
        </div>
    );
}