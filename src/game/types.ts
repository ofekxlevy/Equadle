/**
 * Number of tiles in each equation.
 */
export const EQUATION_LENGTH = 10;

/**
 * Digits that can appear in an equation.
 */
export const DIGIT_TOKENS = [
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
] as const;

/**
 * Operators that can appear in an equation.
 * Note: '^2' is treated as a single tile.
 */
export const OPERATOR_TOKENS = [
  '+',
  '-',
  '*',
  '/',
  '^2',
] as const;

/**
 * Non-operator tokens that can appear in an equation.
 */
export const SPECIAL_TOKENS = [
  '(',
  ')',
  '=',
] as const;

/**
 * All tokens that can appear in an equation.
 */
export const ALLOWED_TOKENS = [
  ...DIGIT_TOKENS,
  ...OPERATOR_TOKENS,
  ...SPECIAL_TOKENS,
] as const;

export type DigitToken = (typeof DIGIT_TOKENS)[number];

export type OperatorToken = (typeof OPERATOR_TOKENS)[number];

export type SpecialToken = (typeof SPECIAL_TOKENS)[number];

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

export function isDigit(token: Token): token is DigitToken {
    return DIGIT_TOKENS.some((digit) => digit === token);
}