import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Rol, Usuario } from '../usuarios/entities/usuario.entity';
import { NotificacionesService } from './notificaciones.service';

@Controller('api/notificaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get('mis-avisos')
  @Roles(Rol.CIUDADANO)
  misAvisos(@GetUser() usuario: Usuario) {
    return this.notificacionesService.misAvisos(usuario.id);
  }
}
