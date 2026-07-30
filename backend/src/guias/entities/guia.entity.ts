import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum CategoriaGuia {
  RECICLABLE = 'reciclable',
  NO_RECICLABLE = 'no_reciclable',
}

@Entity('guias_reciclaje')
export class Guia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column({ type: 'enum', enum: CategoriaGuia })
  categoria: CategoriaGuia;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ name: 'imagen_url', nullable: true })
  imagenUrl?: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
