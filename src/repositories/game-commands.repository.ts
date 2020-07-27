import {inject} from "@loopback/core";
import {DefaultCrudRepository} from "@loopback/repository";
import {GameDataSource} from "../datasources";
import {GameManagementAddPlayer} from "../dtos";
import {Game, GameRelations, Statuses} from "../models";

export class GameCommandsRepository extends DefaultCrudRepository<
  Game,
  typeof Game.prototype.id,
  GameRelations
> {
  constructor(@inject("datasources.game") dataSource: GameDataSource) {
    super(Game, dataSource);
  }

  async setupGame(id: string, gameAsJson: string): Promise<void> {
    await super.updateById(id, {
      gameState: gameAsJson,
    });
  }

  async addPlayer(entity: GameManagementAddPlayer): Promise<Game> {
    let result: any = null;
    do {
      let openGame = await super.findOne({
        //@ts-ignore
        where: {or: [{player1: null}, {player2: null}]},
      });
      if (!openGame) {
        openGame = await super.create({
          lastUpdate: new Date().toISOString(),
          statusId: Statuses.waiting,
        });
      }
      const id = openGame.id;
      const fieldsToUpdate: any = {
        statusId: Statuses[openGame.slotsOpen > 1 ? "waiting" : "inProgress"],
        lastUpdate: new Date().toISOString(),
      };

      const playerIndex = openGame.player1 ? 2 : 1;
      fieldsToUpdate[`player${playerIndex}`] = entity.player;
      fieldsToUpdate[`player${playerIndex}Added`] = entity.playerAdded;

      const gameIdMatches = {id};
      const playerSlotAvailable: any = {};
      playerSlotAvailable[`player${playerIndex}`] = null;
      const updateConditions = [gameIdMatches, playerSlotAvailable];

      await super.updateAll(fieldsToUpdate, {
        and: updateConditions,
      });
      const filledGame = await super.findById(id);
      if (filledGame?.gameHasPlayer(entity.player)) {
        result = filledGame;
      }
    } while (!result);
    return result;
  }
}
