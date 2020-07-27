import {Entity, model, property} from "@loopback/repository";

@model({name: "games"})
export class GameManagement extends Entity {
  @property({
    type: "string",
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: "date",
  })
  lastUpdate: Date;

  @property({
    type: "string",
  })
  statusId: string;

  constructor(data?: Partial<GameManagement>) {
    super(data);
  }
}

export interface GameManagementRelations {
  // describe navigational properties here
}

export type GameManagementWithRelations = GameManagement &
  GameManagementRelations;
