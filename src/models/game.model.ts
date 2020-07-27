import {Entity, model, property} from "@loopback/repository";

@model({name: "games"})
export class Game extends Entity {
  @property({
    type: "string",
    id: true,
    generated: true,
  })
  id: string;

  @property({
    type: "string",
  })
  player1?: string | null;

  @property({
    type: "string",
  })
  player2?: string | null;

  @property({
    type: "date",
  })
  player1Added?: string | null;

  @property({
    type: "date",
  })
  player2Added?: string | null;

  @property({
    type: "string",
  })
  gameState?: string | null;

  @property({
    type: "date",
  })
  lastUpdate: Date;

  @property({
    type: "string",
  })
  statusId: string;

  get isFull(): boolean {
    return this.player1Filled && this.player2Filled;
  }

  get player1Filled(): boolean {
    return !!this.player1;
  }

  get player2Filled(): boolean {
    return !!this.player2;
  }

  get slotsOpen(): number {
    let slots = 0;
    if (this.player1Filled) slots++;
    if (this.player2Filled) slots++;
    return slots;
  }

  gameHasPlayer(playerId: string) {
    return this.player1 === playerId || this.player2 === playerId;
  }

  constructor(data?: Partial<Game>) {
    super(data);
  }
}

export interface GameRelations {
  // describe navigational properties here
}

export type GameWithRelations = Game & GameRelations;
