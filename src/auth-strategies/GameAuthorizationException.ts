import {AuthorizationException} from "../exceptions/AuthorizationException";

export class GameAuthorizationException extends AuthorizationException {
  constructor(message?: string) {
    super(
      message ??
        "The authenticated player does not have permission to access to this game",
    );
  }
}
