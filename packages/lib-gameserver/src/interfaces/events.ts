import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { IGamePlayer } from './GamePlayer';

export enum GameEvents {
  LOG_LINE = 'log',
  PLAYER_CONNECTED = 'player-connected',
  PLAYER_DISCONNECTED = 'player-disconnected',
}

class BaseEvent {
  timestamp: Date = new Date();
  type!: string;
}

export class EventLogLine extends BaseEvent {
  type = GameEvents.LOG_LINE;
  @IsString()
  msg!: string;
}

export class EventPlayerConnected extends BaseEvent {
  type = GameEvents.PLAYER_CONNECTED;
  @ValidateNested()
  @Type(() => IGamePlayer)
  player!: IGamePlayer;
}

export class EventPlayerDisconnected extends BaseEvent {
  type = GameEvents.PLAYER_DISCONNECTED;
  @ValidateNested()
  @Type(() => IGamePlayer)
  player!: IGamePlayer;
}