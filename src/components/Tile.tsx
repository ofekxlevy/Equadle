import type { Tile as TileData } from '../game/types';
import './Tile.css';

type TileProps = {
    tile: TileData;
};

export function Tile({ tile }: TileProps) {
    return (
        <span className={`tile tile-${tile.state}`}>
            {tile.value === '^2' ? (
                <sup className="tile-square">2</sup>
            ) : tile.value === '*' ? (
                '·'
            ) : tile.value === '/' ? (
                <span className="division-symbol">/</span>
            ) : (
                tile.value
            )}
        </span>
    );
}