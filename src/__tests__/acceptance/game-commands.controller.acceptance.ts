import {Client, expect} from "@loopback/testlab";
import {CardDto} from "@scoparella/dtos";
import {fail} from "assert";
import {Card, Face, Game as ScoparellaGame, Suit} from "scoparella.engine";
import {ScoparellaApiApplication} from "../..";
import {PlayCardDto} from "../../dtos";
import {Game, Statuses} from "../../models";
import {GameDataBuilder} from "../builders";
import {setupApplication} from "./test-helper";
describe("GameCommandsController", () => {
  let app: ScoparellaApiApplication;
  let client: Client;

  before("setupApplication", async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  describe("PATCH /game", () => {
    it("Adds player to new game if no slots are available", async () => {
      const builtGame = await new GameDataBuilder(client, app).build();
      const game = builtGame.game;
      expect(game.player1).not.to.be.undefined().and.not.to.be.null();
      expect(game.player2).not.to.be.undefined().and.to.be.null();
      expect(game.gameState).not.to.be.undefined().and.to.be.null();
      expect(game.player1).to.equal(builtGame.players[0].playerId);
    });

    it("Add players to set up full game", async () => {
      const builtGame = await new GameDataBuilder(client, app)
        .setupFullGame()
        .build();
      const game = builtGame.game;
      expect(game.player1).not.to.be.undefined().and.not.to.be.null();
      expect(game.player2).not.to.be.undefined().and.not.to.be.null();
      expect(game.gameState).not.to.be.undefined().and.not.to.be.null();
      expect(game.statusId).not.to.be.undefined().and.not.to.be.null();
      expect(game.lastUpdate).not.to.be.undefined().and.not.to.be.null();
    });
  });

  describe("PUT /game", () => {
    function getScoparellaGame(game: Game): ScoparellaGame {
      if (!game.gameState) {
        fail(
          "gameState in database should have JSON representation of the game",
        );
      }
      return ScoparellaGame.fromJson(game.gameState);
    }

    describe("Bad moves", () => {
      it("Game is not in progress", async () => {
        const {game, players} = await new GameDataBuilder(client, app)
          .setupFullGame()
          .ended()
          .build();
        expect(game.statusId).to.equal(Statuses.completed);
        const response = await client
          .put(`/game`)
          .auth(players[0].auth, {type: "bearer"})
          .send({
            gameId: game.id,
            cardToPlay: {face: Face.Ace, suit: Suit.Clubs},
            cardsToTake: [],
          } as PlayCardDto)
          .expect(400);
        expect(response.body.error.message).to.containEql(
          "Game is not in progress",
        );
      });

      it("Not this player's turn", async () => {
        const {game, players} = await new GameDataBuilder(client, app)
          .setupFullGame()
          .build();
        const scoparellaGame = getScoparellaGame(game);
        const playerWhoseTurnItIsNot =
          scoparellaGame.whoseTurn?.player.id === players[0].playerId
            ? players[1]
            : players[0];
        const response = await client
          .put(`/game`)
          .auth(playerWhoseTurnItIsNot.auth, {type: "bearer"})
          .send({
            gameId: game.id,
            cardToPlay: {face: Face.Ace, suit: Suit.Clubs},
            cardsToTake: [],
          } as PlayCardDto)
          .expect(400);
        expect(response.body.error.message).to.containEql(
          "It is not this player's turn yet",
        );
      });

      it("Player tries to play a card that is not in their hand (also covers cases when card is already on table)", async () => {
        const {game, players} = await new GameDataBuilder(client, app)
          .setupFullGame()
          .build();
        const scoparellaGame = getScoparellaGame(game);
        const playerWhoseTurnItIs =
          scoparellaGame.whoseTurn?.player.id === players[0].playerId
            ? players[0]
            : players[1];
        const playerWhoseTurnItIsNot =
          scoparellaGame.whoseTurn?.player.id ===
          scoparellaGame.hands[0].player.id
            ? scoparellaGame.hands[1]
            : scoparellaGame.hands[0];
        const response = await client
          .put(`/game`)
          .auth(playerWhoseTurnItIs.auth, {type: "bearer"})
          .send({
            gameId: game.id,
            cardToPlay: Card.toDto(playerWhoseTurnItIsNot.cards[0]),
            cardsToTake: [],
          } as PlayCardDto)
          .expect(400);
        expect(response.body.error.message).to.containEql(
          "It is not in this player's hand",
        );
      });

      it("Scopa validation - e.g. taking a sum of face values when exact match is on table", async () => {
        const {game, players} = await new GameDataBuilder(client, app)
          .setupFullGame()
          .almostEnded()
          .build();
        const scoparellaGame = getScoparellaGame(game);
        const playerWhoseTurnItIsHand =
          scoparellaGame.whoseTurn?.player.id ===
          scoparellaGame.hands[0].player.id
            ? scoparellaGame.hands[0]
            : scoparellaGame.hands[1];
        const playerWhoseTurnItIs =
          scoparellaGame.whoseTurn?.player.id === players[0].playerId
            ? players[0]
            : players[1];
        const response = await client
          .put(`/game`)
          .auth(playerWhoseTurnItIs.auth, {type: "bearer"})
          .send({
            gameId: game.id,
            cardToPlay: Card.toDto(playerWhoseTurnItIsHand.cards[0]),
            cardsToTake: [
              {face: Face.Ace, suit: Suit.Coins},
              {face: Face.Five, suit: Suit.Swords},
            ] as CardDto[],
          } as PlayCardDto)
          .expect(400);
        expect(response.body.error.message).to.containEql(
          "Cannot take sum of face values when an exact match is on the table",
        );
      });

      it("The card player attempts to take is not on the table", async () => {
        const {game, players} = await new GameDataBuilder(client, app)
          .setupFullGame()
          .almostEnded()
          .build();
        const scoparellaGame = getScoparellaGame(game);
        const playerWhoseTurnItIsHand =
          scoparellaGame.whoseTurn?.player.id ===
          scoparellaGame.hands[0].player.id
            ? scoparellaGame.hands[0]
            : scoparellaGame.hands[1];
        const playerWhoseTurnItIs =
          scoparellaGame.whoseTurn?.player.id === players[0].playerId
            ? players[0]
            : players[1];
        const response = await client
          .put(`/game`)
          .auth(playerWhoseTurnItIs.auth, {type: "bearer"})
          .send({
            gameId: game.id,
            cardToPlay: Card.toDto(playerWhoseTurnItIsHand.cards[0]),
            cardsToTake: [
              {face: Face.Ace, suit: Suit.Coins},
              {face: Face.Five, suit: Suit.Cups},
            ] as CardDto[],
          } as PlayCardDto)
          .expect(400);
        expect(response.body.error.message).to.containEql(
          "Attempt to take one or more cards that were not on the table",
        );
      });
    });
  });
});
