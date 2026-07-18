 import { Module } from '@nestjs/common';
import { MouService } from './mou.service';
import { MouController } from './mou.controller';

@Module({
  controllers: [MouController],
  providers: [MouService],
  exports: [MouService],
})
export class MouModule {}
