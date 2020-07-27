import {readFileSync} from "fs";
import {sign} from "jsonwebtoken";
import {v4 as newUuid} from "uuid";
export type PlayerAuth = {playerId: string; auth: string};
const privateKey: string = readFileSync("./RS512.key", {encoding: "utf-8"});

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
