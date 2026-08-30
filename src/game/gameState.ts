import type { GameStatus, Tile, Token } from "./types";


type GameState = {
    secret: Token[];
    guesses: Tile[][];
    status: GameStatus;
};