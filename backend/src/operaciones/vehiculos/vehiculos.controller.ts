import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { AsignarVehiculoDto } from '../dto/asignar-vehiculo.dto';
import { EstadoVehiculo } from '../entities/vehiculo.entity';
import { VehiculosService } from './vehiculos.service';

@Controller('api/vehiculos')
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Get()
  findAll(@Query('estado') estado?: EstadoVehiculo) {
    return this.vehiculosService.findAll(estado);
  }

  @Post(':id/asignar')
  asignar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AsignarVehiculoDto,
  ) {
    return this.vehiculosService.asignar(id, dto);
  }
}
