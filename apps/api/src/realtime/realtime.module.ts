import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EventBusService } from './event-bus.service';
import { RealtimeGateway } from './realtime.gateway';

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [EventBusService, RealtimeGateway],
  exports: [EventBusService, RealtimeGateway],
})
export class RealtimeModule {}
