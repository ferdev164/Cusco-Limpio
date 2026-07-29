import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AsignarVehiculoDto } from '../dto/asignar-vehiculo.dto';
import { CrearVehiculoDto } from '../dto/crear-vehiculo.dto';
import { ActualizarVehiculoDto } from '../dto/actualizar-vehiculo.dto';
import { EstadoVehiculo } from '../entities/vehiculo.entity';
import { VehiculosService } from './vehiculos.service';

@Controller('api/vehiculos')
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Get()
  findAll(@Query('estado') estado?: EstadoVehiculo) {
    return this.vehiculosService.findAll(estado);
  }

  @Post()
  crear(@Body() dto: CrearVehiculoDto) {
    return this.vehiculosService.crear(dto);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarVehiculoDto,
  ) {
    return this.vehiculosService.actualizar(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.vehiculosService.eliminar(id);
  }

  @Post(':id/asignar')
  asignar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AsignarVehiculoDto,
  ) {
    return this.vehiculosService.asignar(id, dto);
  }
}