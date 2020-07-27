import {CardDto} from "@scoparella/dtos";

export class PlayCardDto {
  gameId: string;
  cardToPlay: CardDto;
  cardsToTake: CardDto[];
}
