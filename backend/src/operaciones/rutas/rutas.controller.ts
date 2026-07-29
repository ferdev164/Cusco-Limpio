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
import { RutasService } from './rutas.service';
import { CrearRutaDto } from '../dto/crear-ruta.dto';
import { ActualizarRutaDto } from '../dto/actualizar-ruta.dto';

@Controller('api/rutas')
export class RutasController {
  constructor(private readonly rutasService: RutasService) {}

  @Get()
  findAll() {
    return this.rutasService.findAll();
  }

  @Post()
  crear(@Body() dto: CrearRutaDto) {
    return this.rutasService.crear(dto);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarRutaDto,
  ) {
    return this.rutasService.actualizar(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.rutasService.eliminar(id);
  }
}