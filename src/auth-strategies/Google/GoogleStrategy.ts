import {asAuthStrategy, AuthenticationStrategy} from "@loopback/authentication";
import {StrategyAdapter} from "@loopback/authentication-passport";
import {bind, extensionFor, inject} from "@loopback/core";
import {RedirectRoute, Request} from "@loopback/rest";
import {UserProfile} from "@loopback/security";
import {Strategy} from "passport";
import {Logger} from "../../Logger";

@bind(asAuthStrategy, extensionFor("passport.authentication.oauth2.strategy"))
export class GoogleStrategy implements AuthenticationStrategy {
  name = "oauth2-google";
  protected strategy: StrategyAdapter<{id: string; name: string}>;

  constructor(
    @inject("googlePassportStrategy") protected passportStrategy: Strategy,
    @inject("logger") private logger: Logger,
  ) {
    this.logger.trace("Constructing GoogleStrategy...");
    this.strategy = new StrategyAdapter(this.passportStrategy, this.name);
  }
  async authenticate(request: Request): Promise<UserProfile | RedirectRoute> {
    this.logger.trace("GoogleStrategy authenticating request");
    const result = this.strategy.authenticate(request);
    this.logger.trace("GoogleStrategy authentication completed");
    return result;
  }
}
