import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Programacion } from './programacion.entity';
import { Zona } from './zona.entity';

@Entity('horarios')
export class Horario {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Zona, (zona) => zona.horarios, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'zona_id' })
  zona: Zona;

  @Column()
  turno: string;

  @Column({ name: 'hora_inicio', type: 'time' })
  horaInicio: string;

  @Column({ name: 'hora_fin', type: 'time' })
  horaFin: string;

  @Column()
  dias: string;

  @OneToMany(() => Programacion, (programacion) => programacion.horario)
  programaciones: Programacion[];
}
