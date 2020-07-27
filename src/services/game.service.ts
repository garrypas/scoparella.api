import {bind, BindingScope} from "@loopback/core";
import {repository} from "@loopback/repository";
import {GameDto} from "@scoparella/dtos";
import {Statuses} from "../models";
import {GameRepository} from "../repositories";
@bind({scope: BindingScope.SINGLETON})
export class GameService {
  constructor(
    @repository(GameRepository)
    public gameRepository: GameRepository,
  ) {}

  async findById(id: string) {
    const result = await this.gameRepository.findById(id);
    return GameService.getGameDto(id, result.gameState);
  }

  async countActiveGames(): Promise<number> {
    return (
      await this.gameRepository.count({
        or: [{statusId: Statuses.inProgress}, {statusId: Statuses.waiting}],
      })
    ).count;
  }

  static getGameDto(
    id: string,
    gameState?: string | null,
  ): GameDto & {id: string} {
    return Object.assign({id}, gameState ? JSON.parse(gameState) : {});
  }
}
