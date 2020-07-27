import {
  bind,
  BindingScope,
  inject,
  Interceptor,
  InvocationContext,
  Next,
  Provider,
} from "@loopback/core";
import {RequestWithSession, Response, RestBindings} from "@loopback/rest";
import {Logger} from "./../Logger";

@bind({scope: BindingScope.TRANSIENT})
export class LoggingInterceptor implements Provider<Interceptor> {
  constructor(
    @inject(RestBindings.Http.REQUEST) protected request: RequestWithSession,
    @inject(RestBindings.Http.RESPONSE) protected response: Response,
    @inject("logger") private logger: Logger,
  ) {}
  value() {
    return async (invocationCtx: InvocationContext, next: Next) => {
      this.logger.info(
        `${this.request.method} ${this.request.url} gave response ${
          this.response.statusCode
        }${
          this.response.statusMessage ? ` ${this.response.statusMessage}` : ""
        }`,
      );
      return next();
    };
  }
}
