/**
 * Number of tiles in each equation.
 */
export const EQUATION_LENGTH = 10;

/**
 * All tokens that can appear in an equation.
 * Note: '^2' is treated as a single tile.
 */
export const ALLOWED_TOKENS = [
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
  '+',
  '-',
  '*',
  '/',
  '(',
  ')',
  '^2',
  '=',
] as const;

export type Token = (typeof ALLOWED_TOKENS)[number];

export type GameStatus = 'playing' | 'won' | 'lost';

export type TileState = 'correct' | 'present' | 'absent' | 'empty';

/**
 * Represents a single tile on the board.
 * Empty tiles use an empty string as their value.
 */
export type Tile = {
  value: Token | '';
  state: TileState;
};
