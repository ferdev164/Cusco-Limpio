import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum EstadoNotificacion {
  PENDIENTE = 'pendiente',
  ENVIADA = 'enviada',
  FALLIDA = 'fallida',
}

@Entity('notificaciones')
export class Notificacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ciudadanoId: number;

  @Column()
  telefono: string;

  @Column('text')
  mensaje: string;

  @Column({ type: 'enum', enum: EstadoNotificacion, default: EstadoNotificacion.PENDIENTE })
  estado: EstadoNotificacion;

  @Column('int')
  distanciaMetros: number;

  @Column()
  recorridoId: number;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @CreateDateColumn()
  fechaCreacion: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaEnvio: Date | null;
}