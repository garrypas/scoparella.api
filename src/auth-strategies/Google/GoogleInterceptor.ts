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

export class GoogleInterceptor implements Provider<Interceptor> {
  constructor(
    @inject("googleStrategyMiddleware")
    public googleStrategy: ExpressRequestHandler,
    @inject("logger") private logger: Logger,
  ) {}

  value() {
    return async (invocationCtx: InvocationContext, next: Next) => {
      if (
        invocationCtx.getSync<RequestContext>(RestBindings.Http.CONTEXT).request
          .query["oauth2-provider-name"] === "google"
      ) {
        this.logger.trace(
          "oauth2-provider-name='google', so using GoogleInterceptor",
        );
        return toInterceptor(this.googleStrategy)(invocationCtx, next);
      }
      return next();
    };
  }
}
