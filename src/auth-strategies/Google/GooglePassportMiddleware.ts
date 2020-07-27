import {bind, BindingScope, inject, Provider} from "@loopback/core";
import {ExpressRequestHandler} from "@loopback/rest";
import passport from "passport";
import {Strategy as GooglePassportStrategy} from "passport-google-oauth2";
import {Logger} from "../../Logger";

@bind.provider({scope: BindingScope.SINGLETON})
export class GooglePassportMiddleware
  implements Provider<ExpressRequestHandler> {
  constructor(
    @inject("googlePassportStrategy")
    protected strategy: GooglePassportStrategy,
    @inject("logger") private logger: Logger,
  ) {
    this.logger.trace("Creating GooglePassportMiddleware");
    passport.use(this.strategy);
    this.logger.trace("Middleware selected Google strategy");
  }

  value() {
    this.logger.trace(
      "GooglePassportMiddleware invoked Google's passport authenticate() method",
    );
    return passport.authenticate("google");
  }
}
