import {asAuthStrategy, AuthenticationStrategy} from "@loopback/authentication";
import {StrategyAdapter} from "@loopback/authentication-passport";
import {bind, extensionFor, inject} from "@loopback/core";
import {RedirectRoute, Request} from "@loopback/rest";
import {securityId, UserProfile} from "@loopback/security";
import {Strategy} from "passport";
import {Logger} from "../../Logger";

@bind(asAuthStrategy, extensionFor("passport.authentication.oauth2.strategy"))
export class FacebookStrategy implements AuthenticationStrategy {
  name = "oauth2-facebook";
  protected strategy: StrategyAdapter<{id: string; name: string}>;

  constructor(
    @inject("facebookPassportStrategy") protected passportStrategy: Strategy,
    @inject("logger") private logger: Logger,
  ) {
    this.logger.trace("Constructing FacebookStrategy...");
    this.strategy = new StrategyAdapter(
      this.passportStrategy,
      this.name,
      mapProfile.bind(this),
    );
  }
  async authenticate(request: Request): Promise<UserProfile | RedirectRoute> {
    this.logger.trace("FacebookStrategy authenticating request");
    const result = this.strategy.authenticate(request);
    this.logger.trace("FacebookStrategy authentication completed");
    return result;
  }
}

function mapProfile(user: {id: string}): UserProfile {
  const userProfile: UserProfile = {
    [securityId]: "" + user.id,
    profile: {
      ...user,
    },
  };
  return userProfile;
}
