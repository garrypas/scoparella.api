import {readFileSync} from "fs";
import {sign} from "jsonwebtoken";
import {v4 as newUuid} from "uuid";
import {SecretsService} from "../../services/secrets.service";
export type PlayerAuth = {playerId: string; auth: string};
const secrets = SecretsService.getSecrets();
const privateKey: string = readFileSync(secrets.keys.privateKey, {
  encoding: "utf-8",
});

export class JwtAuthenticationBuilder {
  private playerId: any;
  constructor() {}

  forPlayer(playerId: string): JwtAuthenticationBuilder {
    this.playerId = playerId;
    return this;
  }

  forAnyPlayer(): JwtAuthenticationBuilder {
    return this.forPlayer(newUuid());
  }

  build(): PlayerAuth {
    const auth = sign(
      {
        playerId: this.playerId,
        email: `${this.playerId}@emailsim.io`,
        provider: "google",
      },
      {key: privateKey, passphrase: ""},
      {algorithm: "RS512", audience: "localhost.com"},
    );
    return {auth, playerId: this.playerId};
  }
}
