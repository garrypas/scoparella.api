import {AuthenticateFn, AuthenticationBindings} from "@loopback/authentication";
import {inject} from "@loopback/core";
import {Request, ResolvedRoute} from "@loopback/rest";
import {SecurityBindings, UserProfile} from "@loopback/security";
import {Logger} from "../../Logger";

export class AuthHandler {
  constructor(
    @inject(AuthenticationBindings.AUTH_ACTION)
    protected authenticateRequest: AuthenticateFn,
    @inject(SecurityBindings.USER, {optional: true})
    protected user: UserProfile,
    @inject("logger") private logger: Logger,
  ) {
    this.logger.trace("AuthHandler constructed");
  }

  async handle(route: ResolvedRoute, request: Request) {
    if (route.pathParams?.provider) {
      request.query["oauth2-provider-name"] = route.pathParams.provider;
      this.logger.trace(
        `oauth2-provider-name set to ${route.pathParams.provider}`,
      );
    }
    request.user = await this.authenticateRequest(request);
  }
}
