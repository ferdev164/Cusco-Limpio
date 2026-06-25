import { Controller, Get } from '@nestjs/common';
import { ZonasService } from './zonas.service';

@Controller('api/zonas')
export class ZonasController {
  constructor(private readonly zonasService: ZonasService) {}

  @Get()
  findAll() {
    return this.zonasService.findAll();
  }
}
