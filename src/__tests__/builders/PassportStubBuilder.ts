import {createSandbox, SinonSandbox} from "sinon";
import {v4 as newUuid} from "uuid";
import {googleUuid} from "../../auth-strategies/Google/verifyFunction";
import {PlayerService} from "../../services";

export class PassportStubBuilder {
  public profile: any;

  private userProfileStub() {
    return (
      accessToken: string,
      done: (err: string | null, profile: object) => void,
    ) => {
      return done(null, this.profile);
    };
  }

  private successAuthenticateStub = (builder: any) => {
    return function (req: Request, options: any) {
      // @ts-ignore
      return this.success(builder, {});
    };
  };

  private failAuthenticateStub = () => {
    return function () {
      // @ts-ignore
      return this.fail("Failed authentication from stub");
    };
  };

  protected sandbox: SinonSandbox | null;
  protected strategyName: string;
  protected authenticateStub: any = this.successAuthenticateStub;
  constructor(protected passportStrategy: any) {
    this.sandbox = null;
  }

  withName(strategyName: string): PassportStubBuilder {
    this.strategyName = strategyName;
    return this;
  }

  withProfile(profile: any): PassportStubBuilder {
    this.profile = profile;
    this.profile.playerId =
      profile.playerId ?? PlayerService.generateId(newUuid(), googleUuid);
    return this;
  }

  withAnyProfile(): PassportStubBuilder {
    this.withProfile({
      email: "john.smith@emailsim.io",
      photos: "",
      id: "00001111-2222-3333-4444-555566667777",
      username: "johnsmith",
      provider: "google",
      name: "John Smith",
      aud: "localhost.com",
      iat: 1234567890,
    });
    return this;
  }

  get playerId(): string {
    return this.profile?.playerId;
  }

  asValidAuthentication(): PassportStubBuilder {
    this.authenticateStub = this.successAuthenticateStub;
    return this;
  }

  asInvalidAuthentication(): PassportStubBuilder {
    this.authenticateStub = this.failAuthenticateStub;
    return this;
  }

  protected setupSandbox(): SinonSandbox {
    if (!this.strategyName) {
      throw new Error("Cannot build before strategyName is defined");
    }
    return createSandbox();
  }

  build(): PassportStubBuilder {
    this.sandbox = this.setupSandbox();
    if (this.sandbox) this.sandbox.restore();
    this.sandbox
      .stub(this.passportStrategy.prototype as any, "userProfile")
      .callsFake(this.userProfileStub());
    this.sandbox
      .stub(this.passportStrategy.prototype, "authenticate")
      .callsFake(this.authenticateStub(this.profile));
    return this;
  }

  restore(): PassportStubBuilder {
    if (!this.sandbox) {
      throw new Error("Cannot call restore() before build.");
    }
    this.sandbox.restore();
    return this;
  }
}
