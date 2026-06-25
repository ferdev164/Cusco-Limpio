import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Zona } from './zona.entity';

@Entity('rutas')
export class Ruta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @ManyToOne(() => Zona, (zona) => zona.rutas, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'zona_id' })
  zona?: Zona;

  @Column({ nullable: true })
  descripcion: string;

  @Column('decimal', {
    name: 'distancia_km',
    precision: 6,
    scale: 2,
    nullable: true,
  })
  distanciaKm: number;

  @Column({ name: 'tiempo_estimado_min', nullable: true })
  tiempoEstimadoMin: number;
}
