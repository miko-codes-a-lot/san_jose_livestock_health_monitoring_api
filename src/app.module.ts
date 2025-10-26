import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './_shared/configuration';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LivestockGroupModule } from './livestock-group/livestock-group.module';
import { LivestockModule } from './livestock/livestock.module';
import { HealthRecordsModule } from './health-records/health-records.module';
import { InsurancePoliciesModule } from './insurance-policies/insurance-policies.module';
import { ClaimsModule } from './claims/claims.module';
import { LivestockClassificationsModule } from './livestock-classifications/livestock-classifications.module';
import { LivestockBreedsModule } from './livestock-breeds/livestock-breeds.module';
import { MortalityCausesModule } from './mortality-causes/mortality-causes.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'assets'),
      serveRoot: '/static',
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: configuration().db.uri,
        dbName: configuration().db.name,
      }),
    }),
    AuthModule,
    UsersModule,
    LivestockGroupModule,
    LivestockModule,
    HealthRecordsModule,
    InsurancePoliciesModule,
    ClaimsModule,
    LivestockClassificationsModule,
    LivestockBreedsModule,
    MortalityCausesModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
