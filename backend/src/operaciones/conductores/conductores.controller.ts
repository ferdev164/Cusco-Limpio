import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Rol } from '../../usuarios/entities/usuario.entity';
import { ActualizarConductorDto } from '../dto/actualizar-conductor.dto';
import { CrearConductorDto } from '../dto/crear-conductor.dto';
import { ConductoresService } from './conductores.service';

@Controller('api/conductores')
export class ConductoresController {
  constructor(private readonly conductoresService: ConductoresService) {}

  @Get()
  findAll() {
    return this.conductoresService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMINISTRADOR)
  crear(@Body() dto: CrearConductorDto) {
    return this.conductoresService.crear(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMINISTRADOR)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarConductorDto,
  ) {
    return this.conductoresService.actualizar(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMINISTRADOR)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.conductoresService.eliminar(id);
  }
}
