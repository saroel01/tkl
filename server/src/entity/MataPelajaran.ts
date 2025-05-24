import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

export enum KategoriMapel {
  UMUM = 'UMUM',
  PILIHAN = 'PILIHAN',
  MUATAN_LOKAL = 'MUATAN LOKAL',
}

@Entity('mata_pelajaran')
@Unique(['nama_mapel'])
export class MataPelajaran {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  nama_mapel!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  kelompok_mapel?: string | null; // Contoh: Kelompok A, Kelompok B, Peminatan IPA

  @Column({
    type: 'simple-enum',
    enum: KategoriMapel,
    nullable: true, 
  })
  kategori_mapel?: KategoriMapel | null;

  @Column({ type: 'int', nullable: true })
  urutan_mapel?: number | null; // Untuk pengurutan di SKL

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
