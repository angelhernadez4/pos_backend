import { ConfigService } from '@nestjs/config'
import type { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { join } from 'path'
export const typeOrmConfig = (configService: ConfigService) : TypeOrmModuleOptions => ({
    type: 'mongodb',
    url: configService.get('DATABASE_URL'),
    logging: true,
    ssl: true,
    entities: [join(__dirname + '../../**/*.entity.{js,ts}')],
    synchronize: true
})