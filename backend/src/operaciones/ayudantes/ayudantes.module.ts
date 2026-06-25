import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ayudante } from '../entities/ayudante.entity';
import { AyudantesController } from './ayudantes.controller';
import { AyudantesService } from './ayudantes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ayudante])],
  controllers: [AyudantesController],
  providers: [AyudantesService],
})
export class AyudantesModule {}
