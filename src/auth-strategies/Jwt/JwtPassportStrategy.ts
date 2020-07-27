import {bind, BindingScope, inject, Provider} from "@loopback/core";
import {
  ExtractJwt,
  Strategy as PassportStrategy,
  VerifyCallback,
} from "passport-jwt";
import {JwtOptions} from "./JwtOptions";

@bind.provider({scope: BindingScope.SINGLETON})
export class JwtPassportStrategy implements Provider<PassportStrategy> {
  strategy: PassportStrategy;

  constructor(
    @inject("jwtOptions")
    jwtOptions: JwtOptions,
    @inject("jwtVerifyFunction")
    verifyFunction: VerifyCallback,
  ) {
    this.strategy = new PassportStrategy(
      Object.assign(
        {
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          algorithms: [jwtOptions.algorithm],
        },
        jwtOptions,
      ),
      verifyFunction,
    );
  }
  value() {
    return this.strategy;
  }
}
