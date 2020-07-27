const passport = require("passport");
import {bind, BindingScope, inject, Provider} from "@loopback/core";
import {ExpressRequestHandler} from "@loopback/rest";
import {Logger} from "../../Logger";
import {JwtPassportStrategy} from "./JwtPassportStrategy";

@bind.provider({scope: BindingScope.SINGLETON})
export class JwtPassportMiddleware implements Provider<ExpressRequestHandler> {
  constructor(
    @inject("jwtStrategy") protected strategy: JwtPassportStrategy,
    @inject("logger") private logger: Logger,
  ) {
    this.logger.trace("Creating JwtPassportMiddleware");
    passport.use(this.strategy);
    this.logger.trace("Middleware selected JWT strategy");
  }

  value() {
    this.logger.trace(
      "JwtPassportMiddleware invoked JWT passport authenticate() method",
    );
    return passport.authenticate("jwt");
  }
}
