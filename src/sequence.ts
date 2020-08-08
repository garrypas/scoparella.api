import {inject} from "@loopback/core";
import {
  FindRoute,
  InvokeMethod,
  InvokeMiddleware,
  ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  Send,
  SequenceHandler,
} from "@loopback/rest";
import {
  CannotAddMorePlayersError,
  CardAlreadyOnTableError,
  CardNotInPlayersHandError,
  CardsNotOnTableError,
  NoMatchingHandInGameError,
  NotThisPlayersTurnError,
  PlayerAlreadyAddedError,
  ScopaMoveValidationError,
} from "scoparella.engine";
import {GameAuthorizationHandler} from "./auth-strategies/GameAuthorizationHandler";
import {AuthHandler} from "./auth-strategies/Jwt/handleAuth";
import {AuthorizationException, GameNotInProgressException} from "./exceptions";
import {Logger} from "./Logger";
const sequenceActions = RestBindings.SequenceActions;
const badRequestErrorTypes: any[] = [
  GameNotInProgressException,
  CannotAddMorePlayersError,
  NotThisPlayersTurnError,
  PlayerAlreadyAddedError,
  CardNotInPlayersHandError,
  ScopaMoveValidationError,
  NoMatchingHandInGameError,
  CardsNotOnTableError,
  CardAlreadyOnTableError,
];

export class MySequence implements SequenceHandler {
  @inject(sequenceActions.INVOKE_MIDDLEWARE, {optional: true})
  protected invokeMiddleware: InvokeMiddleware = () => false;

  constructor(
    @inject(sequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(sequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(sequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(sequenceActions.SEND) public send: Send,
    @inject(sequenceActions.REJECT) public reject: Reject,
    @inject("authHandler") protected authHandler: AuthHandler,
    @inject("gameAuthorizationHandler")
    protected gameAuthorizationHandler: GameAuthorizationHandler,
    @inject("logger") private logger: Logger,
  ) {}

  async handle(context: RequestContext) {
    try {
      const {request, response} = context;
      const finished = await this.invokeMiddleware(context);
      if (finished) return;
      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);
      this.logger.trace("Bootstrapping authentication handler...");
      await this.authHandler.handle(route, request);
      await this.gameAuthorizationHandler.handle(route, request);
      this.logger.trace("Bootstrapping authentication handler - done");

      this.logger.trace("Invoke route...");
      const result = await this.invoke(route, args);
      this.logger.trace("Invoked route.");

      this.send(response, result);
    } catch (err) {
      this.logger.trace("Error caught in Sequence");
      this.logger.trace(err);
      if (err instanceof AuthorizationException) {
        (err as any).statusCode = 403;
      } else if (badRequestErrorTypes.some(e => err instanceof e)) {
        (err as any).statusCode = 400;
      } else {
        this.logger.warn(err);
      }
      this.reject(context, err);
    }
  }
}
