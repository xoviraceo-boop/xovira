import { Module } from '@nestjs/common';
import { AgentsModule } from './modules/agents.module';
import { MatchingModule } from './modules/matching.module';
import { AnalyticsModule } from './modules/analytics.module';
import { SystemModule } from './modules/system.module';

@Module({
  imports: [SystemModule, MatchingModule, AnalyticsModule, AgentsModule],
})
export class AppModule {}


