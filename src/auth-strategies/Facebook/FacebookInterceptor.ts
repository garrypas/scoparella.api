import {
  inject,
  Interceptor,
  InvocationContext,
  Next,
  Provider,
} from "@loopback/core";
import {
  ExpressRequestHandler,
  RequestContext,
  RestBindings,
  toInterceptor,
} from "@loopback/rest";
import {Logger} from "../../Logger";

export class FacebookInterceptor implements Provider<Interceptor> {
  constructor(
    @inject("facebookStrategyMiddleware")
    public facebookStrategy: ExpressRequestHandler,
    @inject("logger") private logger: Logger,
  ) {}

  value() {
    return async (invocationCtx: InvocationContext, next: Next) => {
      if (
        invocationCtx.getSync<RequestContext>(RestBindings.Http.CONTEXT).request
          .query["oauth2-provider-name"] === "facebook"
      ) {
        this.logger.trace(
          "oauth2-provider-name='facebook', so using FacebookInterceptor",
        );
        return toInterceptor(this.facebookStrategy)(invocationCtx, next);
      }
      return next();
    };
  }
}
