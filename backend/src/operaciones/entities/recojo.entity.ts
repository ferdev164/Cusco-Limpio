import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Programacion } from './programacion.entity';

export enum EstadoRecojo {
  EN_CURSO = 'en_curso',
  FINALIZADO = 'finalizado',
}

@Entity('recojos')
export class Recojo {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Programacion, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'programacion_id' })
  programacion: Programacion;

  @Column({ name: 'hora_inicio', type: 'timestamp' })
  horaInicio: Date;

  @Column({ name: 'hora_fin', type: 'timestamp', nullable: true })
  horaFin?: Date;

  @Column({ name: 'tiempo_transcurrido_min', type: 'int', nullable: true })
  tiempoTranscurridoMin?: number;

  @Column({ type: 'enum', enum: EstadoRecojo, default: EstadoRecojo.EN_CURSO })
  estado: EstadoRecojo;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
