import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { HorariosService } from './horarios.service';
import { CrearHorarioDto } from '../dto/crear-horario.dto';
import { ActualizarHorarioDto } from '../dto/actualizar-horario.dto';

@Controller('api/horarios')
export class HorariosController {
  constructor(private readonly horariosService: HorariosService) {}

  @Post()
  crear(@Body() dto: CrearHorarioDto) {
    return this.horariosService.crear(dto);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarHorarioDto,
  ) {
    return this.horariosService.actualizar(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.horariosService.eliminar(id);
  }

  @Get('zona/:zonaId')
  findByZonaId(@Param('zonaId', ParseIntPipe) zonaId: number) {
    return this.horariosService.findByZonaId(zonaId);
  }

  @Get()
  findZonas() {
    return this.horariosService.findZonas();
  }
  @Get('todos')
  findAll() {
    return this.horariosService.findAll();
  }
  // Esta va AL FINAL: captura cualquier texto como nombre de zona
  @Get(':zona')
  searchByZona(@Param('zona') zona: string) {
    return this.horariosService.searchByZona(zona);
  }
} 