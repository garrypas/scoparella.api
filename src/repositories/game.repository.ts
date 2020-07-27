import {inject} from "@loopback/core";
import {DefaultCrudRepository} from "@loopback/repository";
import {GameDataSource} from "../datasources";
import {Game, GameRelations} from "../models";

export class GameRepository extends DefaultCrudRepository<
  Game,
  typeof Game.prototype.id,
  GameRelations
> {
  constructor(@inject("datasources.game") dataSource: GameDataSource) {
    super(Game, dataSource);
  }
}
