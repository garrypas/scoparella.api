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
      token = await get(
        "http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https%3A%2F%2Fvault.azure.net",
        {
          headers: {
            metadata: "true",
          },
        },
      );
    } catch (e) {
      new ConsoleLogger().error(e);
      throw e;
    }

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

    // Get access token using curl 'http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https%3A%2F%2Fmanagement.azure.com%2F' -H Metadata:true -s
    // Use access token with https://www.npmjs.com/package/@azure/keyvault-secrets to get secrets
    // Write secrets.json
    // Set database password
    // Write RS512.key
    // Write RS512.key.pub
    // return new Promise((resolve, reject) => {
    //   get(podIndentityUri, {}, function (res) {
    //     const statusCode = res.statusCode;
    //     if (!statusCode || statusCode >= 300) {
    //       return reject(`Failed with status code ${statusCode}`);
    //     }
    //     res.setEncoding("utf8");
    //     let rawData = "";
    //     res.on("data", chunk => {
    //       rawData += chunk;
    //     });
    //     res.on("end", () => {
    //       try {
    //         resolve(JSON.parse(rawData).access_token);
    //       } catch (e) {
    //         reject(e.message);
    //       }
    //     });
    //   });
    // })
    //   .then(token => {
    //     //Call Azure with token for secrets and write to files
    //   })
    //   .catch(console.error);
  }
}
// curl 'http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https%3A%2F%2Fvault.azure.net' -H Metadata:true -s

// BEARER="eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Imh1Tjk1SXZQZmVocTM0R3pCRFoxR1hHaXJuTSIsImtpZCI6Imh1Tjk1SXZQZmVocTM0R3pCRFoxR1hHaXJuTSJ9.eyJhdWQiOiJodHRwczovL3ZhdWx0LmF6dXJlLm5ldCIsImlzcyI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzM5Mjg4MDhiLThhNDYtNDI2Yi04Zjg3LTA1MWEzNmJiMmY5MS8iLCJpYXQiOjE1OTY1NzU1NDgsIm5iZiI6MTU5NjU3NTU0OCwiZXhwIjoxNTk2NjYyMjQ4LCJhaW8iOiJFMkJnWUNqeWx1dlJGVHkvcDMraHpnbk5aUjhGQUE9PSIsImFwcGlkIjoiOGQzMGUzMTEtN2IwYy00Mzk0LWFlZTgtMzhhNDY3MTIyMTU5IiwiYXBwaWRhY3IiOiIyIiwiaWRwIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMzkyODgwOGItOGE0Ni00MjZiLThmODctMDUxYTM2YmIyZjkxLyIsIm9pZCI6ImZjZWM5MDJlLTJkM2ItNDdkMC05ZDdjLWI4MjhhMThlMGZlMyIsInN1YiI6ImZjZWM5MDJlLTJkM2ItNDdkMC05ZDdjLWI4MjhhMThlMGZlMyIsInRpZCI6IjM5Mjg4MDhiLThhNDYtNDI2Yi04Zjg3LTA1MWEzNmJiMmY5MSIsInV0aSI6IkJIRDB3dV9mdDBLMkRIYkhjbjhDQUEiLCJ2ZXIiOiIxLjAiLCJ4bXNfbWlyaWQiOiIvc3Vic2NyaXB0aW9ucy8wMDllMGE5OS04YzRjLTQ5ZmItOGVmYi1lNzliZGFlYjU4ZDAvcmVzb3VyY2Vncm91cHMvTUNfcHJlcHJvZC1zY29wYXJlbGxhLXJlc291cmNlLWdyb3VwX3Njb3BhcmVsbGEtYWtzMV93ZXN0ZXVyb3BlL3Byb3ZpZGVycy9NaWNyb3NvZnQuTWFuYWdlZElkZW50aXR5L3VzZXJBc3NpZ25lZElkZW50aXRpZXMvc2NvcGFyZWxsYS1ha3MxLWFnZW50cG9vbCJ9.vI4-YgyUQX22k-6mjGH11NFbZF8Gy778MlH9g4oWyzQTsxa1IhrLvBYo-AQMfumzJh8ceFF_6jQrNhgZwKMxMDB6A9KoGvsULIvaGeT6YYxlSvmzGs80fwbau_s1fDcfDfsaiDIyJ3Qt7t476GP_n1Ny8Gdks1XLZJXo2ZG-9KegWej9Qggz5a6P6bBqnrYAI9ULFSxpn8hmFMBkWnMV6EljA1qtAvT53mJWOy_7BWm743USU_4F2cXz-y3aMdgjdB_aPp89oUIYiZeAHDTCIe1bEFSqCCkEwsZI8--xeSsLY5-3h_lxU5YsUe--kGTXzFcv_dz6QKFNGkxcQwN15A"
// curl https://preprodscoparellavault.vault.azure.net/secrets/dbpassword/?api-version=7.0 -H "Authorization: Bearer $BEARER"

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
