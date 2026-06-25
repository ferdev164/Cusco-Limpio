import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CrearProgramacionDto } from '../dto/crear-programacion.dto';
import { ProgramacionesService } from './programaciones.service';

@Controller('api/programaciones')
export class ProgramacionesController {
  constructor(private readonly programacionesService: ProgramacionesService) {}

  @Get()
  findAll(@Query('zonaId') zonaId?: string) {
    return this.programacionesService.findAll(
      zonaId ? Number(zonaId) : undefined,
    );
  }

  @Post()
  create(@Body() dto: CrearProgramacionDto) {
    return this.programacionesService.create(dto);
  }
}
