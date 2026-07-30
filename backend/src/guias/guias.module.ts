import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guia } from './entities/guia.entity';
import { GuiasController } from './guias.controller';
import { GuiasService } from './guias.service';

@Module({
  imports: [TypeOrmModule.forFeature([Guia])],
  controllers: [GuiasController],
  providers: [GuiasService],
})
export class GuiasModule {}
