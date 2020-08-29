import {Client} from "@loopback/testlab";
import {ScoparellaApiApplication} from "../..";
import {Game, Statuses} from "../../models";
import {GameRepository} from "../../repositories/game.repository";
import {getSecrets} from "./../acceptance/test-helper";
import {JwtAuthenticationBuilder, PlayerAuth} from "./JwtAuthenticationBuilder";
type BuiltGameResult = {game: Game; players: PlayerAuth[]};
const gameStateEnded = require("./../testData/gameState-complete.json");
const gameStateAlmostEnded = require("./../testData/gameState-inProgress.json");

export class GameDataBuilder {
  private fillGame: boolean;
  private client: Client;
  private app: ScoparellaApiApplication;
  private status: Statuses;
  private setToAlmostEnded: boolean;
  private repository: GameRepository;

  constructor(client: Client, app: ScoparellaApiApplication) {
    this.client = client;
    this.app = app;
    this.fillGame = false;
    this.status = Statuses.waiting;
    this.setToAlmostEnded = false;
  }

  setupFullGame(): GameDataBuilder {
    this.fillGame = true;
    return this;
  }

  ended(): GameDataBuilder {
    if (!this.fillGame) {
      throw new Error(
        "Cannot mark a game for completion unless it is first marked to be a full room (e.g. use setupFullGame())",
      );
    }
    this.status = Statuses.completed;
    return this;
  }

  almostEnded(): GameDataBuilder {
    if (!this.fillGame) {
      throw new Error(
        "Cannot mark a game for completion unless it is first marked to be a full room (e.g. use setupFullGame())",
      );
    }
    this.setToAlmostEnded = true;
    return this;
  }

  async build(): Promise<BuiltGameResult> {
    this.repository = await this.app.getRepository(GameRepository);
    const playersAdded: any = {};
    let game: Game;
    const stopCondition = (g: Game) => g.isFull === this.fillGame;
    if (this.status === Statuses.waiting && this.fillGame) {
      this.status = Statuses.inProgress;
    }
    do {
      const thisPlayer = new JwtAuthenticationBuilder(getSecrets())
        .forAnyPlayer()
        .build();
      const res = await this.client
        .patch("/game")
        .auth(thisPlayer.auth, {type: "bearer"})
        .send()
        .expect(200);
      const id = res.body.id;
      game = await this.repository.findById(id);
      playersAdded[thisPlayer.playerId] = thisPlayer;
    } while (!stopCondition(game));
    const players = [];
    if (game.player1) {
      players.push(playersAdded[game.player1]);
    }
    if (game.player2) {
      players.push(playersAdded[game.player2]);
    }
    if (this.status === Statuses.completed && game.player1 && game.player2) {
      game = await this.changeGame(
        game.id,
        this.status,
        getCompletedGame(game.player1, game.player2),
      );
    } else if (this.setToAlmostEnded && game.player1 && game.player2) {
      game = await this.changeGame(
        game.id,
        this.status,
        getAlmostEndedGame(game.player1, game.player2),
      );
    }
    return {game, players};
  }

  private async changeGame(
    gameId: string,
    statusId: Statuses,
    gameState: string,
  ): Promise<Game> {
    await this.repository.updateAll(
      {
        statusId,
        gameState,
      },
      {id: gameId},
    );
    return this.repository.findById(gameId);
  }
}

function getCompletedGame(player1Id: string, player2Id: string) {
  return JSON.stringify(gameStateEnded)
    .replace(/PLAYER_1_ID/g, player1Id)
    .replace(/PLAYER_2_ID/g, player2Id);
}

function getAlmostEndedGame(player1Id: string, player2Id: string) {
  return JSON.stringify(gameStateAlmostEnded)
    .replace(/PLAYER_1_ID/g, player1Id)
    .replace(/PLAYER_2_ID/g, player2Id);
}
