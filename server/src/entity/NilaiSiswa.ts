import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Siswa } from './Siswa';
import { MataPelajaran } from './MataPelajaran';

@Entity('nilai_siswa')
@Unique(['siswa', 'mataPelajaran']) // Menggunakan objek relasi untuk unique constraint
export class NilaiSiswa {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Siswa, siswa => siswa.nilai_siswa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'siswa_id' })
  siswa!: Siswa;

  @ManyToOne(() => MataPelajaran, mataPelajaran => mataPelajaran.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mapel_id' })
  mataPelajaran!: MataPelajaran;

  @Column({ type: 'float', nullable: true })
  nilai?: number | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
