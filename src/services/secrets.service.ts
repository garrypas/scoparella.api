import {readFileSync} from "fs";
import {resolve} from "path";
export class SecretsService {
  private static secrets: any = null;
  static getSecrets() {
    console.log(process.env);
    if (!this.secrets) {
      const path = resolve(
        __dirname,
        `../../secrets${process.env.TEST ? ".test" : ""}.json`,
      );
      this.secrets = JSON.parse(
        readFileSync(path, {
          encoding: "utf-8",
        }),
      );
    }
    return this.secrets;
  }
}
