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
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Rol } from '../usuarios/entities/usuario.entity';
import { ActualizarGuiaDto } from './dto/actualizar-guia.dto';
import { CrearGuiaDto } from './dto/crear-guia.dto';
import { GuiasService } from './guias.service';

@Controller('api/guias')
export class GuiasController {
  constructor(private readonly guiasService: GuiasService) {}

  @Get()
  listar() {
    return this.guiasService.listar();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMINISTRADOR)
  crear(@Body() dto: CrearGuiaDto) {
    return this.guiasService.crear(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMINISTRADOR)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarGuiaDto,
  ) {
    return this.guiasService.actualizar(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMINISTRADOR)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.guiasService.eliminar(id);
  }
}
