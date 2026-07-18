import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { LettersModule } from './modules/letters/letters.module';
import { MeetingsModule } from './modules/meetings/meetings.module';
import { ArchivesModule } from './modules/archives/archives.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { VolunteersModule } from './modules/volunteers/volunteers.module';
import { FinanceModule } from './modules/finance/finance.module';
import { DonationsModule } from './modules/donations/donations.module';
import { EmergencyModule } from './modules/emergency/emergency.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { AssetsModule } from './modules/assets/assets.module';
import { AmbulanceModule } from './modules/ambulance/ambulance.module';
import { WorkOrdersModule } from './modules/work-orders/work-orders.module';
import { TrainingsModule } from './modules/trainings/trainings.module';
import { BloodDonationsModule } from './modules/blood-donations/blood-donations.module';
import { MouModule } from './modules/mou/mou.module';
import { CommandCenterModule } from './modules/command-center/command-center.module';
import { TteModule } from './modules/tte/tte.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { PresensiModule } from './modules/presensi/presensi.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', '..', 'public'), exclude: ['/api*'] }),
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRATION', '24h') },
      }),
      global: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    AuditLogsModule,
    LettersModule,
    MeetingsModule,
    ArchivesModule,
    EmployeesModule,
    VolunteersModule,
    FinanceModule,
    DonationsModule,
    EmergencyModule,
    WarehouseModule,
    AssetsModule,
    AmbulanceModule,
    WorkOrdersModule,
    TrainingsModule,
    BloodDonationsModule,
    MouModule,
    CommandCenterModule,
    TteModule,
    ApprovalsModule,
    PresensiModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
