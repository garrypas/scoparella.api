// Uncomment these imports to begin using these cool features!

import {authenticate, AuthenticationBindings} from "@loopback/authentication";
import {inject, service} from "@loopback/core";
import {
  get,
  param,
  RequestWithSession,
  Response,
  RestBindings,
} from "@loopback/rest";
import {UserProfile} from "@loopback/security";
import {JwtAuthService} from "../auth-strategies/Jwt/JwtAuthService";
import {Logger} from "../Logger";
import {passportMiddleware} from "./../auth-strategies/passportMiddleware";

export class AuthController {
  constructor() {}

  @authenticate("oauth2-google")
  @get("/api/auth/thirdparty/google")
  loginToThirdPartyGoogle(
    @inject(AuthenticationBindings.AUTHENTICATION_REDIRECT_URL)
    redirectUrl: string,
    @inject(AuthenticationBindings.AUTHENTICATION_REDIRECT_STATUS)
    status: number,
    @inject(RestBindings.Http.RESPONSE)
    response: Response,
  ) {
    return this._loginToThirdParty("google", redirectUrl, status, response);
  }

  @authenticate("oauth2-facebook")
  @get("/api/auth/thirdparty/facebook")
  loginToThirdPartyFacebook(
    @inject(AuthenticationBindings.AUTHENTICATION_REDIRECT_URL)
    redirectUrl: string,
    @inject(AuthenticationBindings.AUTHENTICATION_REDIRECT_STATUS)
    status: number,
    @inject(RestBindings.Http.RESPONSE)
    response: Response,
  ) {
    return this._loginToThirdParty("facebook", redirectUrl, status, response);
  }

  private async _loginToThirdParty(
    provider: string,
    redirectUrl: string,
    status: number,
    response: Response,
  ) {
    response.statusCode = status || 302;
    response.setHeader("Location", redirectUrl);
    response.end();
    return response;
  }

  @passportMiddleware()
  @get("/api/auth/thirdparty/{provider}/callback")
  async thirdPartyCallBack(
    @param.path.string("provider") provider: string,
    @inject(RestBindings.Http.REQUEST) request: RequestWithSession,
    @inject(RestBindings.Http.RESPONSE) response: Response,
    @service(JwtAuthService) authService: JwtAuthService,
    @inject("logger") logger: Logger,
  ) {
    logger.trace(`Callback invoked for ${provider}`);
    const jwtToken = await authService.generateToken(
      request.user as UserProfile,
    );
    logger.trace(`Callback invoked for ${provider}`);
    response.statusCode = 202;
    return {
      jwtToken,
    };
  }
}
