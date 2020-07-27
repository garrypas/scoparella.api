import {Strategy as JwtStrategy} from "passport-jwt";
import {PassportStubBuilder} from "./PassportStubBuilder";

export class JwtPassportStubBuilder extends PassportStubBuilder {
  constructor() {
    super(JwtStrategy);
  }

  build(): PassportStubBuilder {
    this.withName("jwt");
    if (this.sandbox) this.sandbox.restore();
    this.sandbox = this.setupSandbox();
    this.sandbox
      .stub(this.passportStrategy.prototype, "authenticate")
      .callsFake(this.authenticateStub(this.profile));
    return this;
  }
}
