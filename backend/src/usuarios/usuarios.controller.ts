import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CrearCuentaConductorDto } from './dto/crear-cuenta-conductor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from './entities/usuario.entity';

@Controller('api/usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMINISTRADOR)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('conductores')
  listarConductores() {
    return this.usuariosService.listarConductores();
  }

  @Post('conductores/:id/cuenta')
  crearCuentaConductor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CrearCuentaConductorDto,
  ) {
    return this.usuariosService.crearCuentaConductor(id, dto);
  }
}
