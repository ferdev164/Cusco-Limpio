import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Rol, Usuario } from '../../usuarios/entities/usuario.entity';
import { IniciarRecojoDto } from '../dto/iniciar-recojo.dto';
import { ReporteQueryDto } from '../dto/reporte-query.dto';
import { RecojosService } from './recojos.service';

@Controller('api/recojos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecojosController {
  constructor(private readonly recojosService: RecojosService) {}

  @Get('mis-programaciones')
  @Roles(Rol.CONDUCTOR)
  misProgramaciones(@GetUser() usuario: Usuario) {
    return this.recojosService.misProgramaciones(usuario.id);
  }

  @Post('iniciar')
  @Roles(Rol.CONDUCTOR)
  iniciar(@GetUser() usuario: Usuario, @Body() dto: IniciarRecojoDto) {
    return this.recojosService.iniciar(usuario.id, dto.programacionId);
  }

  @Post(':id/finalizar')
  @Roles(Rol.CONDUCTOR)
  finalizar(
    @GetUser() usuario: Usuario,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.recojosService.finalizar(usuario.id, id);
  }

  @Get()
  @Roles(Rol.ADMINISTRADOR)
  listar() {
    return this.recojosService.listar();
  }

  @Get('reportes')
  @Roles(Rol.ADMINISTRADOR)
  reportes(@Query() query: ReporteQueryDto) {
    return this.recojosService.reportesPorZona(query);
  }
}
