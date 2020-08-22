// See https://github.com/Azure/aad-pod-identity for how this connects to aad-pod-identity

import {readFileSync} from "fs";
import {get as http_get, RequestOptions as http_options} from "http";
import {get as https_get, RequestOptions as https_options} from "https";
import {ConfigService} from ".";
import {ConsoleLogger} from "../Logger";

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires: string;
  expires_on: string;
  not_before: string;
  resource: string;
  token_type: string;
};

export class RemoteSecretService {
  static async getSecrets(): Promise<any> {
    const logger = new ConsoleLogger();
    if (process.env.TEST) {
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
    let token: TokenResponse;
    try {
      logger.info("Making call to the remote secret store");
      token = await get(
        "http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https%3A%2F%2Fvault.azure.net",
        {
          headers: {
            metadata: "true",
          },
        },
      );
    } catch (e) {
      logger.error(e);
      throw e;
    }

    logger.info("Got a token to access the remote secret store");

    return {
      google: {
        clientSecret: "todo",
      },
      facebook: {
        clientSecret: "todo",
      },
      database: {
        password: await requestSecret("dbpassword", token),
      },
      publicKey: await requestSecret("public-key", token),
      privateKey: await requestSecret("private-key", token),
    };
  }
}

async function requestSecret(secret: string, token: TokenResponse) {
  const uri = `https://preprodscoparellavault.vault.azure.net/secrets/${secret}/?api-version=7.0`;
  return get(uri, {
    headers: {
      Authorization: `${token.token_type} ${token.access_token}`,
    },
  });
}

async function get(
  url: string,
  options: http_options | https_options,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const getter = url.startsWith("https") ? https_get : http_get;
    getter(url, options, function (res) {
      const statusCode = res.statusCode;
      if (!statusCode || statusCode >= 300) {
        return reject(`Failed with status code ${statusCode}`);
      }
      res.setEncoding("utf8");
      let rawData = "";
      res.on("data", chunk => {
        rawData += chunk;
      });
      res.on("end", () => {
        try {
          resolve(JSON.parse(rawData).access_token);
        } catch (e) {
          reject(e.message);
        }
      });
    });
  });
}
