import {bind, BindingScope, inject} from "@loopback/core";
import {UserProfile} from "@loopback/security";
import {sign} from "jsonwebtoken";
import {Logger} from "../../Logger";

@bind({scope: BindingScope.SINGLETON})
export class JwtAuthService {
  constructor(
    @inject("jwtOptions") protected options: any,
    @inject("logger") private logger: Logger,
  ) {}

  async generateToken(userProfile: UserProfile): Promise<string> {
    this.logger.trace("generating JWT token for the user profile");
    const token = sign(
      userProfile,
      {key: this.options.privateKey, passphrase: this.options.passphrase || ""},
      {algorithm: this.options.algorithm, audience: this.options.audience},
    );
    this.logger.trace("JWT token generated");
    return token;
  }
}
