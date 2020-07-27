import {Client, expect} from "@loopback/testlab";
import {v4 as newUuid} from "uuid";
import {ScoparellaApiApplication} from "../..";
import {GameResponseDto} from "../../dtos/GameResponseDto";
import {Game} from "../../models";
import {GameDataBuilder} from "../builders";
import {PlayerAuth} from "../builders/JwtAuthenticationBuilder";
import {setupApplication} from "./test-helper";

describe("GameQueriesController", () => {
  let app: ScoparellaApiApplication;
  let client: Client;

  before("setupApplication", async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  describe("Authenticated user", () => {
    let game: Game;
    let players: PlayerAuth[];

    before(async () => {
      const builtGame = await new GameDataBuilder(client, app)
        .setupFullGame()
        .almostEnded()
        .build();
      game = builtGame.game;
      players = builtGame.players;
    });

    it("GET /game/{id} returns the state of the game if the player is authenticated and one of the players involved", async () => {
      const gameId = game.id;
      await client
        .get(`/game/${gameId}`)
        .auth(players[0].auth, {type: "bearer"})
        .expect(200);
    });

    it("GET /game/{id} returns 403 for any gameId that isn't mine (even if the game doesn't exist)", async () => {
      await client
        .get(`/game/${newUuid()}`)
        .auth(players[0].auth, {type: "bearer"})
        .expect(403);
    });

    it("GET /game/{id} removes the deck from all requests", async () => {
      const gameId = game.id;
      const gameResponse = await client
        .get(`/game/${gameId}`)
        .auth(players[0].auth, {type: "bearer"})
        .expect(200);
      const responseBody = gameResponse.body;
      expect(responseBody.deck).to.be.undefined();
    });

    it("GET /game/{id} returns other player's cards as a count only", async () => {
      const gameId = game.id;
      const gameResponse = await client
        .get(`/game/${gameId}`)
        .auth(players[0].auth, {type: "bearer"})
        .expect(200);
      const responseBody = gameResponse.body as GameResponseDto;
      expect(responseBody.otherHands[0].cards).to.be.type("number");
    });

    it("GET /game/{id} returns last move", async () => {
      const gameId = game.id;
      const gameResponse = await client
        .get(`/game/${gameId}`)
        .auth(players[0].auth, {type: "bearer"})
        .expect(200);
      const responseBody = gameResponse.body as GameResponseDto;
      expect(responseBody.lastMove?.timestamp).to.equal(
        "2020-07-26T00:28:07.032Z",
      );
    });
  });

  describe("Unauthenticated user", () => {
    it("GET /game/{id} returns 401", async () => {
      await client.get(`/game/${newUuid()}`).expect(401);
    });
  });

  it("Count games", async () => {
    await client.get("/game/count").expect(200);
  });
});
