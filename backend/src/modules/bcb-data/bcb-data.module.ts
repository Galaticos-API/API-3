import { Module } from '@nestjs/common';
import { BcbDataController } from './bcb-data.controller';

@Module({
  controllers: [BcbDataController]
})
export class BcbDataModule {}
