import {authenticate} from "@loopback/authentication";
import {inject, service} from "@loopback/core";
import {
  getModelSchemaRef,
  patch,
  put,
  Request,
  requestBody,
  RestBindings,
} from "@loopback/rest";
import {gameAuthorization} from "../auth-strategies/gameAuthorization";
import {User} from "../auth-strategies/User";
import {GameManagementAddPlayer, PlayCardDto} from "../dtos";
import {GameCommands, GameService} from "../services";

export class GameCommandsController {
  constructor(
    @service(GameService) public gameService: GameService,
    @service(GameCommands) public gameCommands: GameCommands,
    @inject(RestBindings.Http.REQUEST) private req: Request,
  ) {}

  @authenticate("jwt")
  @patch("/game", {
    responses: {
      "204": {
        description:
          "Attempt to join an open room, will create a new room if none are available",
      },
    },
  })
  async replaceById(): Promise<{id: string}> {
    const user = this.req.user as User;
    return this.gameCommands.addPlayer({
      player: user.playerId,
      playerAdded: new Date().toISOString(),
    } as GameManagementAddPlayer);
  }

  @authenticate("jwt")
  @gameAuthorization()
  @put("/game")
  async playCard(
    @requestBody({
      content: {
        "application/json": {
          schema: getModelSchemaRef(PlayCardDto, {partial: true}),
        },
      },
    })
    playCardDto: PlayCardDto,
  ): Promise<void> {
    const user = this.req.user as User;
    await this.gameCommands.play(playCardDto, user.playerId);
  }
}
