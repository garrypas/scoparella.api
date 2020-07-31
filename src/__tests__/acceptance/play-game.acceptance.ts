import {Client, expect} from "@loopback/testlab";
import {fail} from "assert";
import {Card, Game, GameStatus, Hand} from "scoparella.engine";
import {ScoparellaApiApplication} from "../..";
import {PlayCardDto} from "../../dtos";
import {GameRepository} from "../../repositories";
import {GameDataBuilder} from "../builders/GameDataBuilder";
import {PlayerAuth} from "../builders/JwtAuthenticationBuilder";
import {setupApplication} from "./test-helper";

describe("Play a whole game", () => {
  let app: ScoparellaApiApplication;
  let client: Client;
  let gameId: string;
  let repository: GameRepository;

  before("setupApplication", async () => {
    ({app, client} = await setupApplication());
    repository = await app.getRepository(GameRepository);
  });

  after(async () => {
    await app.stop();
  });

  describe("Authenticated", function () {
    this.timeout(30000);
    let player1: PlayerAuth;
    let player2: PlayerAuth;
    let current: PlayerAuth;

    let game: Game;
    beforeEach(async function () {
      const builtGame = await new GameDataBuilder(client, app)
        .setupFullGame()
        .build();
      const gameDbo = builtGame.game;
      player1 = builtGame.players[0];
      player2 = builtGame.players[1];
      gameId = gameDbo.id;
      expect(gameDbo.gameState).not.to.be.undefined();
      game = Game.fromJson(gameDbo.gameState ?? "{}");
    });

    const playCard = async (hand: Hand) => {
      const card = hand.cards[0];
      const cardsThatCanBeTaken = determineWhichCardsIfAnyCanBeTakenWithAGivenCardInHand(
        card,
        game.table.cards,
      );
      await client
        .put(`/game`)
        .auth(current.auth, {type: "bearer"})
        .send({
          cardToPlay: Card.toDto(card),
          cardsToTake: Card.toDtoArray(cardsThatCanBeTaken),
          gameId,
        } as PlayCardDto)
        .expect(204);
      const gameNow = await repository.findById(gameId);
      if (!gameNow.gameState) {
        fail(`No gameState in the database for ${gameId}`);
      }
      game = Game.fromJson(gameNow.gameState);
    };

    it("Play a game to conclusion", async () => {
      while (game.status !== GameStatus.ENDED) {
        for (let i = 0; i < 36; i++) {
          if (game.whoseTurn) {
            current =
              player1.playerId === game.whoseTurn.player.id ? player1 : player2;
            await playCard(game.whoseTurn);
            continue;
          }
          throw new Error("Not this person's turn");
        }
      }

      console.log(`Game id: ${gameId}`);
      console.log(
        `Player 1 (${game.score(game.hands[0].player)} - ${game.score(
          game.hands[1].player,
        )}) Player 2`,
      );
      expect(game.moves).not.to.have.lessThanOrEqual(37);
      expect(game.roundsPlayed).to.be.greaterThan(0);
      expect(
        game.score(game.hands[0].player) >= 11 ||
          game.score(game.hands[1].player) >= 11,
      ).to.be.true();
    });
  });
});

function getExactMatch(
  cardInHand: Card,
  cardsOnTable: Card[],
): Card | undefined {
  return cardsOnTable.find(cardOnTable => cardOnTable.faceEquals(cardInHand));
}

function getSumMatch(
  cardInHand: Card,
  cardsOnTable: Card[],
): Card[] | undefined {
  return cardInHand.getFaceSumMatches(cardsOnTable)[0] || undefined;
}

function determineWhichCardsIfAnyCanBeTakenWithAGivenCardInHand(
  cardInHand: Card,
  cardsOnTable: Card[],
): Card[] {
  const exactMatch = getExactMatch(cardInHand, cardsOnTable);
  if (exactMatch) {
    return [exactMatch];
  }
  const sumMatch = getSumMatch(cardInHand, cardsOnTable);
  if (sumMatch) {
    return sumMatch;
  }
  return [];
}
