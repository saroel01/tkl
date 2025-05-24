import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { NilaiSiswa } from './NilaiSiswa';

export enum StatusKelulusan {
  LULUS = 'LULUS',
  TIDAK_LULUS = 'TIDAK LULUS',
  PROSES = 'PROSES', // Jika ada tahapan verifikasi sebelum final
  BELUM_DITENTUKAN = 'BELUM DITENTUKAN',
}

@Entity('siswa')
export class Siswa {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  nisn!: string;

  @Column({ type: 'varchar', length: 255 })
  nama_lengkap!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tempat_lahir?: string | null;

  @Column({ type: 'date', nullable: true })
  tanggal_lahir?: string | null; // Disimpan sebagai string YYYY-MM-DD

  @Column({ type: 'varchar', length: 255, nullable: true })
  nama_orang_tua_wali?: string | null;

  @Column({ type: 'varchar', length: 50 })
  kelas!: string; // Contoh: XII IPA 1, XII IPS 2

  @Column({ type: 'varchar', length: 100, nullable: true })
  jurusan?: string | null; // Contoh: IPA, IPS, Bahasa, Teknik Komputer Jaringan

  @Column({
    type: 'simple-enum',
    enum: StatusKelulusan,
    default: StatusKelulusan.BELUM_DITENTUKAN,
  })
  status_kelulusan!: StatusKelulusan;

  @Column({ type: 'text', nullable: true })
  catatan_admin?: string | null; // Catatan tambahan dari admin untuk siswa tertentu

  @Column({ type: 'varchar', length: 255, nullable: true })
  foto_siswa_path?: string | null;

  @Index({ unique: true, where: "nomor_ijazah IS NOT NULL" }) // Unique constraint only if not null
  @Column({ type: 'varchar', length: 100, nullable: true })
  nomor_ijazah?: string | null;

  @Index({ unique: true, where: "nomor_skhun IS NOT NULL" }) // Unique constraint only if not null
  @Column({ type: 'varchar', length: 100, nullable: true })
  nomor_skhun?: string | null;
  
  @Column({ type: 'varchar', length: 20, nullable: true })
  nomor_peserta_ujian?: string | null; // Nomor peserta ujian nasional/sekolah

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => NilaiSiswa, nilaiSiswa => nilaiSiswa.siswa)
  nilai_siswa!: NilaiSiswa[];

  @Index({ unique: true, where: "token_skl IS NOT NULL" })
  @Column({ type: 'varchar', length: 255, nullable: true })
  token_skl?: string | null;
}
