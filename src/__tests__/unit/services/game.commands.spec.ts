import {
  createStubInstance,
  expect,
  sinon,
  StubbedInstanceWithSinonAccessor,
} from "@loopback/testlab";
import {fail} from "assert";
import {Game as ScoparellaGame, GameStatus} from "scoparella.engine";
import Sinon, {SinonSandbox} from "sinon";
import {GameManagementAddPlayer} from "../../../dtos";
import {Game, Statuses} from "../../../models";
import {GameCommandsRepository, GameRepository} from "../../../repositories";
import {GameCommands} from "../../../services";
import {GameBuilder} from "../../builders/GameBuilder";
import {GameManagementAddPlayerBuilder} from "../../builders/GameManagementAddPlayerBuilder";
const gameThatIsOneCardFromRoundCompletion = require("../../testData/gameState-inProgress.json");
describe("game.commands unit tests", () => {
  let sandbox: SinonSandbox;

  let game: Game;

  let gameBuilder: GameBuilder;
  let gameManagementAddPlayerBuilder: GameManagementAddPlayerBuilder;

  let gameCommands: GameCommands;
  let gameCommandsRepository: StubbedInstanceWithSinonAccessor<GameCommandsRepository>;
  let gameRepository: StubbedInstanceWithSinonAccessor<GameRepository>;
  let scoparellaGame: ScoparellaGame | undefined;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    gameCommandsRepository = createStubInstance(GameCommandsRepository);
    gameRepository = createStubInstance(GameRepository);
    gameBuilder = new GameBuilder();
    gameManagementAddPlayerBuilder = new GameManagementAddPlayerBuilder();
    gameCommands = new GameCommands(gameCommandsRepository, gameRepository);
    game = gameBuilder.build();
    (gameCommandsRepository.addPlayer as Sinon.SinonStub).callsFake(
      (entity: GameManagementAddPlayer) => {
        game = gameBuilder.addPlayer(entity.player).build();
        return Promise.resolve(game);
      },
    );
    (gameRepository.findById as Sinon.SinonStub).callsFake(() =>
      Promise.resolve(game),
    );
    scoparellaGame = undefined;
    (gameCommandsRepository.setupGame as Sinon.SinonStub).callsFake(
      (id, gameJsonStr) => {
        scoparellaGame = ScoparellaGame.fromJson(gameJsonStr);
        return Promise.resolve();
      },
    );
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe("addPlayer()", () => {
    it("Adds a player to a game when there is a space available in and existing game", async () => {
      game = gameBuilder.addPlayer().build();
      const addPlayerData = gameManagementAddPlayerBuilder
        .addAnyPlayer()
        .build();
      await gameCommands.addPlayer(addPlayerData);
      expect(scoparellaGame?.hands[1].player.id).to.equal(addPlayerData.player);
    });

    it("Add player to new game, but doesn't set game up yet", async () => {
      game = gameBuilder.build();
      const addPlayerData = gameManagementAddPlayerBuilder
        .addAnyPlayer()
        .build();
      await gameCommands.addPlayer(addPlayerData);
      sandbox.assert.calledWithMatch(
        gameCommandsRepository.addPlayer as Sinon.SinonStub,
        addPlayerData,
      );
      expect(scoparellaGame).to.be.undefined();
    });
  });

  describe("play()", () => {
    beforeEach(() => {
      (gameCommandsRepository.updateAll as Sinon.SinonStub).resolves();
      game = gameBuilder
        .withState(gameThatIsOneCardFromRoundCompletion)
        .build();
    });
    it("Updates game state when move was successful (game status changing)", async () => {
      if (!game.player2) {
        fail();
      }
      await gameCommands.play(
        {
          gameId: game.id,
          cardToPlay: {
            face: "Six",
            suit: "Cups",
          },
          cardsToTake: [
            {
              face: "Six",
              suit: "Swords",
            },
          ],
        },
        game.player2,
      );
      sinon.assert.calledWithMatch(
        gameCommandsRepository.updateAll as Sinon.SinonStub,
        {
          gameState: sinon.match(`"status":"${GameStatus.ENDED}"`),
          statusId: Statuses.completed,
        },
      );
    });
  });
});
