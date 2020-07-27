import {bind, BindingScope, inject, Provider} from "@loopback/core";
import {RequestWithSession, RestBindings} from "@loopback/rest";
import {
  Strategy as PassportStrategy,
  StrategyOptions,
  VerifyFunction,
} from "passport-google-oauth2";

function mergeQueryIntoOptions(
  googleOptions: any,
  query: any,
): StrategyOptions {
  const options = Object.assign({}, googleOptions);
  if (!query) return options;
  ["callbackURL", "successRedirect", "failureRedirect"].forEach(key => {
    if (query[key]) {
      options[key] = query[key];
    }
  });
  return options;
}

@bind.provider({scope: BindingScope.TRANSIENT})
export class GooglePassportStrategy implements Provider<PassportStrategy> {
  strategy: PassportStrategy;

  constructor(
    @inject("googleOptions")
    public googleOptions: StrategyOptions,
    @inject("googleVerifyFunction")
    googleVerifyFunction: VerifyFunction,
    @inject(RestBindings.Http.REQUEST, {optional: true})
    request: RequestWithSession | undefined,
  ) {
    this.strategy = new PassportStrategy(
      mergeQueryIntoOptions(this.googleOptions, request?.query),
      googleVerifyFunction,
    );
  }

  value() {
    return this.strategy;
  }
}
