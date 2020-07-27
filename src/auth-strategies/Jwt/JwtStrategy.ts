import {asAuthStrategy, AuthenticationStrategy} from "@loopback/authentication";
import {StrategyAdapter} from "@loopback/authentication-passport";
import {bind, extensionFor, inject} from "@loopback/core";
import {RedirectRoute, Request} from "@loopback/rest";
import {UserProfile} from "@loopback/security";
import {Strategy} from "passport";
import {Logger} from "../../Logger";

@bind(asAuthStrategy, extensionFor("passport.authentication.oauth2.strategy"))
export class JwtStrategy implements AuthenticationStrategy {
  name = "jwt";
  protected strategy: StrategyAdapter<{id: string; name: string}>;

  constructor(
    @inject("jwtStrategy") protected passportStrategy: Strategy,
    @inject("logger") private logger: Logger,
  ) {
    this.logger.trace("Constructing JwtStrategy...");
    this.strategy = new StrategyAdapter(this.passportStrategy, this.name);
  }
  async authenticate(request: Request): Promise<UserProfile | RedirectRoute> {
    this.logger.trace("JwtStrategy authenticating request");
    const result = this.strategy.authenticate(request);
    this.logger.trace("JwtStrategy authentication completed");
    return result;
  }
}
