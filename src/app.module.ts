import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { CommentsModule } from './comments/comments.module';
import { CoursesModule } from './courses/courses.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacultiesModule } from './faculties/faculties.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      database: process.env.DB_NAME,
      synchronize: true,
    }),
    UserModule,
    CommentsModule,
    CoursesModule,
    AuthModule,
    FacultiesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
