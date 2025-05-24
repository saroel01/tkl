import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('pengaturan_sekolah')
export class PengaturanSekolah {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nama_sekolah!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logo_sekolah_path!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logo_dinas_path!: string;

  @Column({ type: 'datetime', nullable: true })
  tanggal_rilis!: Date;

  @Column({ type: 'boolean', default: false })
  akses_aktif!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nama_dinas?: string | null;

  @Column({ type: 'text', nullable: true })
  alamat_sekolah_lengkap?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  kontak_sekolah?: string | null; // Misal: Telp. (xxxx) xxx, Faks. (xxxx) xxx

  @Column({ type: 'varchar', length: 255, nullable: true })
  website_sekolah?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  npsn_sekolah?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nama_kepala_sekolah?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nip_kepala_sekolah?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  kota_penerbitan_skl?: string | null; // Misal: Lhokseumawe

  @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Contoh: 2023/2024' })
  tahun_ajaran?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: 'Contoh: Ujian Sekolah (US)' })
  jenis_ujian_skl?: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
