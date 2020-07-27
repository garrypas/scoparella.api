import {authenticate} from "@loopback/authentication";
import {inject, service} from "@loopback/core";
import {CountSchema} from "@loopback/repository";
import {
  get,
  getModelSchemaRef,
  param,
  Request,
  RestBindings,
} from "@loopback/rest";
import {gameAuthorization} from "../auth-strategies/gameAuthorization";
import {User} from "../auth-strategies/User";
import {GameResponseDto} from "../dtos/GameResponseDto";
import {Game} from "../models";
import {GameService} from "../services";
export class GameQueriesController {
  constructor(
    @service(GameService) public gameService: GameService,
    @inject(RestBindings.Http.REQUEST) private req: Request,
  ) {}

  @authenticate("jwt")
  @gameAuthorization()
  @get("/game/{gameId}", {
    responses: {
      "200": {
        description: "Game model instance",
        content: {
          "application/json": {
            schema: getModelSchemaRef(Game, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string("gameId") gameId: string,
  ): Promise<GameResponseDto> {
    const game = Object.assign({}, await this.gameService.findById(gameId));
    const user = this.req.user as User;
    return GameResponseDto.create(game, user.playerId);
  }

  @get("/game/count", {
    responses: {
      "200": {
        description: "GameManagement model count",
        content: {"application/json": {schema: CountSchema}},
      },
    },
  })
  async count(): Promise<number> {
    return this.gameService.countActiveGames();
  }
}
