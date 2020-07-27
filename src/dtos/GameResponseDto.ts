import {
  CardDto,
  GameDto,
  HandDto,
  MoveLogItemDto,
  ScoreboardDto,
  TableDto,
} from "@scoparella/dtos";

export class GameResponseDto {
  private constructor() {}

  numberOfPlayers: number;
  hand: CardDto[];
  otherHands: {playerId: string; cards: number}[];
  table: TableDto;
  lastTaker: HandDto | undefined;
  whoseTurn: HandDto | undefined;
  scoreboard: ScoreboardDto;
  roundsPlayed: number;
  lastMove: MoveLogItemDto | null;
  status: string;

  static create(gameDto: GameDto, playerId: string): GameResponseDto {
    const hand = gameDto.hands.find(h => h.player.id === playerId)?.cards;
    const otherHands = gameDto.hands.filter(h => h.player.id !== playerId);
    if (!hand) {
      throw new Error("Cards for this hand could not be determined.");
    }
    if (!otherHands) {
      throw new Error(
        "Cards for the opposing player hand could not be determined.",
      );
    }
    return {
      numberOfPlayers: gameDto.numberOfPlayers,
      hand,
      otherHands: otherHands.map(oh => ({
        playerId: oh.player.id,
        cards: oh.cards.length,
      })),
      table: gameDto.table,
      lastTaker: gameDto.lastTaker,
      whoseTurn: gameDto.whoseTurn,
      scoreboard: gameDto.scoreboard,
      roundsPlayed: gameDto.roundsPlayed,
      lastMove:
        gameDto.moves.length > 0
          ? gameDto.moves[gameDto.moves.length - 1]
          : null,
      status: gameDto.status,
    } as GameResponseDto;
  }
}
