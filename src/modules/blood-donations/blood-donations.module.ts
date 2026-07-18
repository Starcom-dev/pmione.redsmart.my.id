import { Module } from '@nestjs/common';
import { BloodDonationsService } from './blood-donations.service';
import { BloodDonationsController } from './blood-donations.controller';

@Module({
  controllers: [BloodDonationsController],
  providers: [BloodDonationsService],
  exports: [BloodDonationsService],
})
export class BloodDonationsModule {}
