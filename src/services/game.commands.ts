import {bind, BindingScope} from "@loopback/core";
import {repository} from "@loopback/repository";
import {GameDto} from "@scoparella/dtos";
import {
  Card,
  Game,
  Game as ScoparellaGame,
  GameStatus,
  Player as ScoparellaPlayer,
} from "scoparella.engine";
import {GameManagementAddPlayer, PlayCardDto} from "../dtos";
import {GameNotInProgressException} from "../exceptions";
import {Statuses} from "../models";
import {GameCommandsRepository, GameRepository} from "../repositories";

@bind({scope: BindingScope.SINGLETON})
export class GameCommands {
  constructor(
    @repository(GameCommandsRepository)
    public gameCommandsRepository: GameCommandsRepository,
    @repository(GameRepository)
    public gameRepository: GameRepository,
  ) {}

  private createGameObject(player1: string, player2: string): GameDto {
    const game = new ScoparellaGame({numberOfPlayers: 2});
    game.addPlayer(new ScoparellaPlayer(player1));
    game.addPlayer(new ScoparellaPlayer(player2));
    return ScoparellaGame.toDto(game);
  }

  async addPlayer(entity: GameManagementAddPlayer): Promise<{id: string}> {
    const result = await this.gameCommandsRepository.addPlayer(entity);
    if (result.isFull) {
      const game = await this.gameRepository.findById(result.id);

      if (game.player1 && game.player2) {
        const gameObject = this.createGameObject(game.player1, game.player2);
        const gameObjectStr = JSON.stringify(gameObject);
        await this.gameCommandsRepository.setupGame(result.id, gameObjectStr);
      }
    }
    return {id: result.id};
  }

  async play(playCardDto: PlayCardDto, playerId: string): Promise<GameDto> {
    const {cardToPlay, cardsToTake, gameId} = playCardDto;
    const gameData = await this.gameRepository.findById(gameId);
    if (gameData.statusId !== Statuses.inProgress || !gameData.gameState) {
      throw new GameNotInProgressException("Game is not in progress.");
    }
    const game = ScoparellaGame.fromJson(gameData.gameState);
    const hand = game.hands.find(h => h.player.id === playerId);
    if (!hand) {
      throw new Error(
        `A hand for the player id ${playerId} was not found, which shouldn't be possible because gameAuthorization should prevent it.`,
      );
    }
    game.tryPlayCards(
      Card.fromDto(cardToPlay),
      Card.fromDtoArray(cardsToTake),
      hand,
    );
    const dto = Game.toDto(game);
    await this.gameCommandsRepository.updateAll({
      gameState: JSON.stringify(dto),
      lastUpdate: new Date().toISOString(),
      statusId:
        game.status === GameStatus.IN_PROGRESS
          ? Statuses.inProgress
          : Statuses.completed,
    });

    return dto;
  }
}
