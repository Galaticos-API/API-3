import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BcbDataModule } from './modules/bcb-data/bcb-data.module';

@Module({
  imports: [BcbDataModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
