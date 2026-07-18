import { Module } from '@nestjs/common';
import { TteService } from './tte.service';
import { TteController } from './tte.controller';

@Module({
  controllers: [TteController],
  providers: [TteService],
  exports: [TteService],
})
export class TteModule {}
