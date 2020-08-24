// See https://github.com/Azure/aad-pod-identity for how this connects to aad-pod-identity

import {readFileSync} from "fs";
import {get as http_get, RequestOptions as http_options} from "http";
import {get as https_get, RequestOptions as https_options} from "https";
import {ConfigService} from ".";
import {ConsoleLogger} from "../Logger";
const logger = new ConsoleLogger();

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
        clientSecret: await requestSecret("authgoog", token),
      },
      facebook: {
        clientSecret: await requestSecret("authfb", token),
      },
      database: {
        password: await requestSecret("dbpassword", token),
      },
      publicKey: await requestSecret("public-key", token),
      privateKey: await requestSecret("private-key", token),
    };
  }
}
/*
cat << EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: demo
  labels:
    aadpodidbinding: preprodkubepod
spec:
  containers:
  - name: demo
    image: mcr.microsoft.com/k8s/aad-pod-identity/demo:1.2
    args:
      - --subscriptionid=009e0a99-8c4c-49fb-8efb-e79bdaeb58d0
      - --clientid=005a9048-060c-4460-80ff-ccdcd073f07d
      - --resourcegroup=preprod-scoparella-resource-group
    env:
      - name: MY_POD_NAME
        valueFrom:
          fieldRef:
            fieldPath: metadata.name
      - name: MY_POD_NAMESPACE
        valueFrom:
          fieldRef:
            fieldPath: metadata.namespace
      - name: MY_POD_IP
        valueFrom:
          fieldRef:
            fieldPath: status.podIP
  nodeSelector:
    kubernetes.io/os: linux
EOF
*/

// curl 'http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https%3A%2F%2Fmanagement.azure.com%2F' -H Metadata:true -s
// curl 'http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https%3A%2F%2Fvault.azure.net' -H Metadata:true
// BEARER="access token"
// curl https://preprodscoparellavault.vault.azure.net/secrets/public-key/?api-version=7.0 -H "Authorization: Bearer $BEARER"
async function requestSecret(secret: string, token: TokenResponse) {
  const uri = `https://preprodscoparellavault.vault.azure.net/secrets/${secret}/?api-version=7.0`;
  return get(uri, {
    headers: {
      Authorization: `${token.token_type} ${token.access_token}`,
    },
  })
    .then(() => logger.info(`Retrieved secret ${secret}`))
    .catch(err => logger.error(`Failed to get secret '${secret} - ${err}'`));
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
        return reject(`Failed to get secret with status code ${statusCode}`);
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
