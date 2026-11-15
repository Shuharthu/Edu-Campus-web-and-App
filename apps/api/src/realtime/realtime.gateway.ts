import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { IncomingMessage } from 'node:http';
import type WebSocket from 'ws';
import type { Server } from 'ws';
import type { DomainEventEnvelope } from '@smart-edu/types';
import { getEnv } from '../config/env';
import { EventBusService } from './event-bus.service';

interface ClientMeta {
  userId: string;
  institutionId: string;
  campusId?: string | null;
}

@WebSocketGateway({ path: '/ws' })
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit, OnModuleDestroy
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private readonly clients = new Map<WebSocket, ClientMeta>();
  private unsubscribeBus: (() => void) | null = null;

  constructor(
    private readonly jwtService: JwtService,
    private readonly eventBus: EventBusService,
  ) {}

  onModuleInit(): void {
    this.unsubscribeBus = this.eventBus.subscribe((envelope) => {
      this.broadcast(envelope);
    });
  }

  onModuleDestroy(): void {
    this.unsubscribeBus?.();
  }

  handleConnection(client: WebSocket, req: IncomingMessage): void {
    try {
      const url = new URL(req.url ?? '/ws', 'http://localhost');
      const token = url.searchParams.get('token');
      if (!token) {
        client.close(4001, 'Missing token');
        return;
      }
      const env = getEnv();
      const payload = this.jwtService.verify<{
        sub: string;
        institutionId: string;
        campusId?: string | null;
      }>(token, { secret: env.JWT_ACCESS_SECRET });

      this.clients.set(client, {
        userId: payload.sub,
        institutionId: payload.institutionId,
        campusId: payload.campusId,
      });

      client.on('message', (raw) => {
        if (raw.toString() === '{"type":"ping"}') {
          client.send('{"type":"pong"}');
        }
      });

      client.send(
        JSON.stringify({
          type: 'connected',
          connectedClients: this.clients.size,
          timestamp: new Date().toISOString(),
        }),
      );
    } catch {
      client.close(4003, 'Unauthorized');
    }
  }

  handleDisconnect(client: WebSocket): void {
    this.clients.delete(client);
  }

  getConnectedCount(): number {
    return this.clients.size;
  }

  private broadcast(envelope: DomainEventEnvelope): void {
    const serialized = JSON.stringify(envelope);
    for (const [socket, meta] of this.clients.entries()) {
      if (meta.institutionId !== envelope.institutionId) continue;
      if (envelope.campusId && meta.campusId && meta.campusId !== envelope.campusId) continue;
      if (socket.readyState === 1) {
        socket.send(serialized);
      }
    }
  }
}
