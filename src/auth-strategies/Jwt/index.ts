import {createBindingFromClass} from "@loopback/core";
import {RestApplication} from "@loopback/rest";
import {VerifiedCallback} from "passport-jwt";
// import {GameAuthorizationHandler} from "./../gameAuthorization";
import {AuthHandler} from "./handleAuth";
import {JwtAuthService} from "./JwtAuthService";
import {JwtInterceptor} from "./JwtInterceptor";
import {JwtOptions} from "./JwtOptions";
import {JwtPassportMiddleware} from "./JwtPassportMiddleware";
import {JwtPassportStrategy} from "./JwtPassportStrategy";
import {JwtStrategy} from "./JwtStrategy";

const verifyFunction = (jwtPayload: any, done: VerifiedCallback) =>
  done(null, jwtPayload);

export function setupStrategy(app: RestApplication, options: JwtOptions) {
  app.bind("jwtOptions").to(options);
  app.bind("jwtVerifyFunction").to(verifyFunction);

  app.add(createBindingFromClass(JwtPassportStrategy, {key: "jwtStrategy"}));
  app.add(createBindingFromClass(JwtStrategy));
  app.add(
    createBindingFromClass(JwtPassportMiddleware, {
      key: "jwtStrategyMiddleware",
    }),
  );
  app.bind("passport-jwt").toProvider(JwtInterceptor);
  app.add(createBindingFromClass(JwtAuthService, {key: "jwtAuthService"}));
  app.add(createBindingFromClass(AuthHandler, {key: "authHandler"}));
}
