import {MethodDecoratorFactory} from "@loopback/core";
import {GameAuthorizationMetadata} from "./GameAuthorizationMetadata";

export function gameAuthorization(spec?: string): MethodDecorator {
  return MethodDecoratorFactory.createDecorator<GameAuthorizationMetadata>(
    "game-authorization-decorator",
    {gameIdentifierInPath: spec ?? "gameId"},
  );
}
