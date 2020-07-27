import {bind, BindingScope, inject, Provider} from "@loopback/core";
import {
  Strategy as PassportStrategy,
  StrategyOption,
  VerifyFunction,
} from "passport-facebook";

@bind.provider({scope: BindingScope.SINGLETON})
export class FacebookPassportStrategy implements Provider<PassportStrategy> {
  strategy: PassportStrategy;

  constructor(
    @inject("facebookOptions")
    public facebookOptions: StrategyOption,
    @inject("facebookVerifyFunction")
    facebookVerifyFunction: VerifyFunction,
  ) {
    this.strategy = new PassportStrategy(
      this.facebookOptions,
      facebookVerifyFunction,
    );
  }

  value() {
    return this.strategy;
  }
}
