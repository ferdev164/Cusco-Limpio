import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Programacion } from './programacion.entity';

@Entity('ayudantes')
export class Ayudante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ default: true })
  disponible: boolean;

  @Column({ default: true })
  activo: boolean;

  @ManyToMany(() => Programacion, (programacion) => programacion.ayudantes)
  programaciones: Programacion[];
}
