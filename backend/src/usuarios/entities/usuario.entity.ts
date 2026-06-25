import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum Rol {
  CIUDADANO = 'ciudadano',
  ADMINISTRADOR = 'administrador',
  CONDUCTOR = 'conductor',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  correo: string;

  @Column()
  contrasena: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ type: 'enum', enum: Rol, default: Rol.CIUDADANO })
  rol: Rol;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;
}