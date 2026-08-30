import type { Tile as TileData } from '../game/types';
import { Tile } from './Tile';

type BoardProps = {
    guesses: TileData[][];
};

export function Board({ guesses }: BoardProps) {
    return (
        <div>
            {guesses.map((guess, guessIndex) => (
                <div key={guessIndex}>
                    {guess.map((tile, tileIndex) => (
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