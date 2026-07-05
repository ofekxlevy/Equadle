export type GameStatus = 'playing' | 'won' | 'lost';

export type TileState = 'correct' | 'present' | 'absent' | 'empty';

export type Tile = {
    value: string;
    state: TileState;
};



