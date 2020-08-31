import {
  Constructor,
  CoreBindings,
  Getter,
  inject,
  MetadataInspector,
} from "@loopback/core";
import {repository} from "@loopback/repository";
import {Request, ResolvedRoute} from "@loopback/rest";
import {UserProfile} from "@loopback/security";
import {GameRepository} from "../repositories";
import {GameAuthorizationException} from "./GameAuthorizationException";
import {GameAuthorizationMetadata} from "./GameAuthorizationMetadata";

export class GameAuthorizationHandler {
  constructor(
    @inject.getter(CoreBindings.CONTROLLER_CLASS)
    private readonly getController: Getter<Constructor<{}>>,
    @inject.getter(CoreBindings.CONTROLLER_METHOD_NAME)
    private readonly getMethod: Getter<string>,
    @repository(GameRepository)
    public gameRepository: GameRepository,
  ) {}
  async handle(route: ResolvedRoute, request: Request) {
    let controller;
    try {
      controller = await this.getController();
    } catch (err) {
      return;
    }
    const controllerClass = controller.prototype;
    const methodName: string = await this.getMethod();
    const metadata = MetadataInspector.getMethodMetadata<
      GameAuthorizationMetadata
    >("game-authorization-decorator", controllerClass, methodName);
    if (metadata) {
      const idKey = metadata.gameIdentifierInPath ?? "gameId";
      const gameId: string = route.pathParams[idKey];
      const user = request.user as UserProfile;
      const playerId = user.playerId;
      if (!playerId) {
        throw new GameAuthorizationException(
          "User does not have a playerId in their profile",
        );
      }
      const matchingGamesThatCanBeAccessed = await this.gameRepository.count({
        id: gameId,
        or: [{player1: playerId}, {player2: playerId}],
      });
      if (matchingGamesThatCanBeAccessed.count < 1) {
        throw new GameAuthorizationException();
      }
    }
  }
}
