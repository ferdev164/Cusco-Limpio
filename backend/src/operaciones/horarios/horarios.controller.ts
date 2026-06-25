import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { HorariosService } from './horarios.service';

@Controller('api/horarios')
export class HorariosController {
  constructor(private readonly horariosService: HorariosService) {}

  @Get('zona/:zonaId')
  findByZonaId(@Param('zonaId', ParseIntPipe) zonaId: number) {
    return this.horariosService.findByZonaId(zonaId);
  }

  @Get(':zona')
  searchByZona(@Param('zona') zona: string) {
    return this.horariosService.searchByZona(zona);
  }

  @Get()
  findZonas() {
    return this.horariosService.findZonas();
  }
}
