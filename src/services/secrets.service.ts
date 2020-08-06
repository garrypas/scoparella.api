import {RemoteSecretService} from "./remote-secrets.service";
export class SecretsService {
  private static secrets: any = null;
  static async getSecrets() {
    if (!this.secrets) {
      this.secrets = await RemoteSecretService.getSecrets();
    }
    return Object.assign({}, this.secrets);
  }
}
