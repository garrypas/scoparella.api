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

export class JwtInterceptor implements Provider<Interceptor> {
  constructor(
    @inject("jwtStrategyMiddleware")
    public jwtStrategy: ExpressRequestHandler,
    @inject("logger") private logger: Logger,
  ) {}

  value() {
    return async (invocationCtx: InvocationContext, next: Next) => {
      if (
        invocationCtx.getSync<RequestContext>(RestBindings.Http.CONTEXT).request
          .query["oauth2-provider-name"] === "jwt"
      ) {
        this.logger.trace(
          "oauth2-provider-name='jwt', so using JwtInterceptor",
        );
        return toInterceptor(this.jwtStrategy)(invocationCtx, next);
      }
      return next();
    };
  }
}
