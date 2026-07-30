import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guia } from './entities/guia.entity';
import { CrearGuiaDto } from './dto/crear-guia.dto';
import { ActualizarGuiaDto } from './dto/actualizar-guia.dto';

@Injectable()
export class GuiasService {
  constructor(
    @InjectRepository(Guia) private readonly guiasRepo: Repository<Guia>,
  ) {}

  listar() {
    return this.guiasRepo.find({ order: { creadoEn: 'DESC' } });
  }

  async crear(dto: CrearGuiaDto) {
    const guia = this.guiasRepo.create(dto);
    return this.guiasRepo.save(guia);
  }

  async actualizar(id: number, dto: ActualizarGuiaDto) {
    const guia = await this.guiasRepo.findOne({ where: { id } });
    if (!guia) throw new NotFoundException('Guia no encontrada');
    Object.assign(guia, dto);
    return this.guiasRepo.save(guia);
  }

  async eliminar(id: number) {
    const guia = await this.guiasRepo.findOne({ where: { id } });
    if (!guia) throw new NotFoundException('Guia no encontrada');
    await this.guiasRepo.remove(guia);
    return { mensaje: 'Guia eliminada' };
  }
}
