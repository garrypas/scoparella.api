import {
  Client,
  createRestAppClient,
  givenHttpServerConfig,
} from "@loopback/testlab";
import {readFileSync} from "fs";
import {ScoparellaApiApplication} from "../..";
import {ConfigService} from "../../services";

export function getSecrets() {
  const config = ConfigService.getConfig();

  return {
    google: {
      clientSecret: "todo",
    },
    facebook: {
      clientSecret: "todo",
    },
    database: {
      password: "P@ss55w0rd",
    },
    publicKey: readFileSync(config.keys.publicKey, {
      encoding: "utf-8",
    }),
    privateKey: readFileSync(config.keys.privateKey, {
      encoding: "utf-8",
    }),
  };
}

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
  });

  const app = new ScoparellaApiApplication(
    {
      rest: restConfig,
    },
    getSecrets(),
  );
  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

export interface AppWithClient {
  app: ScoparellaApiApplication;
  client: Client;
}
