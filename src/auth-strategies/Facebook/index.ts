import {createBindingFromClass} from "@loopback/core";
import {RestApplication} from "@loopback/rest";
import {FacebookInterceptor} from "./FacebookInterceptor";
import {FacebookPassportMiddleware} from "./FacebookPassportMiddleware";
import {FacebookPassportStrategy} from "./FacebookPassportStrategy";
import {FacebookStrategy} from "./FacebookStrategy";
import {verifyFunction} from "./verifyFunction";

export function setupStrategy(app: RestApplication, options: any) {
  app.bind("facebookOptions").to(options);
  app.bind("facebookVerifyFunction").to(verifyFunction);
  app.add(
    createBindingFromClass(FacebookPassportStrategy, {
      key: "facebookPassportStrategy",
    }),
  );
  app.add(createBindingFromClass(FacebookStrategy, {key: "facebookStrategy"}));
  app.add(
    createBindingFromClass(FacebookPassportMiddleware, {
      key: "facebookStrategyMiddleware",
    }),
  );
  app.bind("passport-facebook").toProvider(FacebookInterceptor);
}
