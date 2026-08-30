import type { Tile as TileData, Token } from '../game/types';
import { EQUATION_LENGTH } from '../game/types';
import { MAX_GUESSES } from '../game/gameState';
import { Tile } from './Tile';

type BoardProps = {
    guesses: TileData[][];
    currentGuess: Token[];
};

export function Board({ guesses, currentGuess }: BoardProps) {

    const currentRow: TileData[] = Array.from(
        { length: EQUATION_LENGTH },
        (_, index) => ({
            value: currentGuess[index] ?? '',
            state: 'empty',
        })
    );

    const shouldShowCurrentRow =
        guesses.length < MAX_GUESSES;

    const emptyRowsCount =
        MAX_GUESSES
        - guesses.length
        - (shouldShowCurrentRow ? 1 : 0);

    const emptyRows: TileData[][] = Array.from(
        { length: emptyRowsCount },
        () =>
            Array.from(
                { length: EQUATION_LENGTH },
                () => ({
                    value: '',
                    state: 'empty',
                })
            )
    );

    const rows = [
        ...guesses,
        ...(shouldShowCurrentRow ? [currentRow] : []),
        ...emptyRows,
    ];

    return (
        <div>
            {rows.map((row, rowIndex) => (
                <div key={rowIndex}>
                    {row.map((tile, tileIndex) => (
                        <Tile
                            key={tileIndex}
                            tile={tile}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}