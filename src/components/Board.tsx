import type { Tile as TileData } from '../game/types';
import { EQUATION_LENGTH } from '../game/types';
import { MAX_GUESSES } from '../game/gameState';
import { Tile } from './Tile';

type BoardProps = {
    guesses: TileData[][];
};

export function Board({ guesses }: BoardProps) {
    const emptyRowsCount = MAX_GUESSES - guesses.length;

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