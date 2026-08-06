import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { CommentsModule } from './comments/comments.module';
import { CoursesModule } from './courses/courses.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacultiesModule } from './faculties/faculties.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis, { createKeyv, Keyv } from '@keyv/redis';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UtilitiesModule } from './utilities/utilities.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        stores: [createKeyv(`redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`)],
      }),
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      database: process.env.DB_NAME,
    }),
    UserModule,
    CommentsModule,
    CoursesModule,
    AuthModule,
    FacultiesModule,

    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 120,
          limit: 100,
        },
      ],
    }),

    UtilitiesModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],
})
export class AppModule {}
