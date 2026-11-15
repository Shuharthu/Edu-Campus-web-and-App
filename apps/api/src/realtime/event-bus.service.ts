import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EventEmitter } from 'node:events';
import crypto from 'node:crypto';
import Redis from 'ioredis';
import type { DomainEventEnvelope, DomainEventName } from '@smart-edu/types';
import { getEnv } from '../config/env';

const CHANNEL = 'smartedu.events';

@Injectable()
export class EventBusService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventBusService.name);
  private readonly localEmitter = new EventEmitter();
  private pubClient: Redis | null = null;
  private subClient: Redis | null = null;
  private redisConnected = false;

  async onModuleInit(): Promise<void> {
    const env = getEnv();
    if (env.ENABLE_LOCAL_NO_REDIS_DEV) {
      this.logger.warn('ENABLE_LOCAL_NO_REDIS_DEV=true: using in-memory dev event bus fallback');
      return;
    }

    try {
      this.pubClient = new Redis(env.REDIS_URL, { maxRetriesPerRequest: 2, lazyConnect: true });
      this.subClient = new Redis(env.REDIS_URL, { maxRetriesPerRequest: 2, lazyConnect: true });
      await Promise.all([this.pubClient.connect(), this.subClient.connect()]);
      await this.subClient.subscribe(CHANNEL);
      this.subClient.on('message', (_ch, raw) => {
        try {
          const parsed = JSON.parse(raw) as DomainEventEnvelope;
          this.localEmitter.emit('event', parsed);
        } catch (err) {
          this.logger.error('Failed to parse domain event from Redis', err);
        }
      });
      this.redisConnected = true;
      this.logger.log('Connected to Redis Pub/Sub event bus');
    } catch (err) {
      this.logger.error('Redis connection failed at startup', err);
      throw err;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pubClient?.quit().catch(() => undefined);
    await this.subClient?.quit().catch(() => undefined);
  }

  isRedisReady(): boolean {
    return this.redisConnected;
  }

  async publish<T extends Record<string, unknown>>(params: {
    event: DomainEventName;
    institutionId: string;
    campusId?: string | null;
    payload: T;
  }): Promise<DomainEventEnvelope<T>> {
    const envelope: DomainEventEnvelope<T> = {
      id: crypto.randomUUID(),
      event: params.event,
      version: 1,
      institutionId: params.institutionId,
      campusId: params.campusId ?? null,
      occurredAt: new Date().toISOString(),
      payload: params.payload,
    };

    if (this.redisConnected && this.pubClient) {
      await this.pubClient.publish(CHANNEL, JSON.stringify(envelope));
    } else {
      this.localEmitter.emit('event', envelope);
    }

    return envelope;
  }

  subscribe(handler: (envelope: DomainEventEnvelope) => void): () => void {
    this.localEmitter.on('event', handler);
    return () => this.localEmitter.off('event', handler);
  }
}
