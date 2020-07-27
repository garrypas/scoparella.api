import {createBindingFromClass} from "@loopback/core";
import {RestApplication} from "@loopback/rest";
import {StrategyOptions} from "passport-google-oauth2";
import {GoogleInterceptor} from "./GoogleInterceptor";
import {GooglePassportMiddleware} from "./GooglePassportMiddleware";
import {GooglePassportStrategy} from "./GooglePassportStrategy";
import {GoogleStrategy} from "./GoogleStrategy";
import {verifyFunction} from "./verifyFunction";

export function setupStrategy(app: RestApplication, options: StrategyOptions) {
  app.bind("googleOptions").to(options);
  app.bind("googleVerifyFunction").to(verifyFunction);
  app.add(
    createBindingFromClass(GooglePassportStrategy, {
      key: "googlePassportStrategy",
    }),
  );
  app.add(createBindingFromClass(GoogleStrategy, {key: "googleStrategy"}));
  app.add(
    createBindingFromClass(GooglePassportMiddleware, {
      key: "googleStrategyMiddleware",
    }),
  );
  app.bind("passport-google").toProvider(GoogleInterceptor);
}
