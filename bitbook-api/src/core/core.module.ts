import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmConfigModule } from './database/typeorm.module';
import { JwtConfigModule } from './jwt/jwt-config.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmConfigModule,
        JwtConfigModule,
    ],
    exports: [JwtConfigModule],
})
export class CoreModule { }
