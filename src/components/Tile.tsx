import type { Tile as TileData } from '../game/types';
import './Tile.css';

type TileProps = {
    tile: TileData;
};

export function Tile({ tile }: TileProps) {
    return (
        <span className={`tile tile-${tile.state}`}>
            {tile.value}
        </span>
    );
}