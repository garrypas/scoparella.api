const passport = require("passport");
import {bind, BindingScope, inject, Provider} from "@loopback/core";
import {ExpressRequestHandler} from "@loopback/rest";
import {Strategy as FacebookPassportStrategy} from "passport-facebook";
import {Logger} from "../../Logger";

@bind.provider({scope: BindingScope.SINGLETON})
export class FacebookPassportMiddleware
  implements Provider<ExpressRequestHandler> {
  constructor(
    @inject("facebookPassportStrategy")
    protected strategy: FacebookPassportStrategy,
    @inject("logger") private logger: Logger,
  ) {
    this.logger.trace("Creating FacebookPassportMiddleware");
    passport.use(this.strategy);
    this.logger.trace("Middleware selected Facebook strategy");
  }

  value() {
    this.logger.trace(
      "FacebookPassportMiddleware invoked Facebook's passport authenticate() method",
    );
    return passport.authenticate("facebook");
  }
}
