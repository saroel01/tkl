import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class InitialDatabaseSetup1748065901640 implements MigrationInterface {
    name = 'InitialDatabaseSetup1748065901640'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create PengaturanSekolah Table
        await queryRunner.createTable(new Table({
            name: "pengaturan_sekolah",
            columns: [
                { name: "id", type: "integer", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
                { name: "nama_sekolah", type: "varchar", length: "255", isNullable: true },
                { name: "logo_sekolah_path", type: "varchar", length: "255", isNullable: true },
                { name: "logo_dinas_path", type: "varchar", length: "255", isNullable: true },
                { name: "tanggal_rilis", type: "datetime", isNullable: true },
                { name: "akses_aktif", type: "boolean", default: false, isNullable: false },
                { name: "nama_dinas", type: "varchar", length: "255", isNullable: true },
                { name: "alamat_sekolah_lengkap", type: "text", isNullable: true },
                { name: "kontak_sekolah", type: "varchar", length: "255", isNullable: true },
                { name: "website_sekolah", type: "varchar", length: "255", isNullable: true },
                { name: "npsn_sekolah", type: "varchar", length: "100", isNullable: true },
                { name: "nama_kepala_sekolah", type: "varchar", length: "255", isNullable: true },
                { name: "nip_kepala_sekolah", type: "varchar", length: "50", isNullable: true },
                { name: "kota_penerbitan_skl", type: "varchar", length: "100", isNullable: true },
                { name: "tahun_ajaran", type: "varchar", length: "50", isNullable: true },
                { name: "jenis_ujian_skl", type: "varchar", length: "255", isNullable: true },
                { name: "created_at", type: "datetime", default: "datetime('now')", isNullable: false },
                { name: "updated_at", type: "datetime", default: "datetime('now')", isNullable: false },
            ]
        }), true);

        // Create Siswa Table
        await queryRunner.createTable(new Table({
            name: "siswa",
            columns: [
                { name: "id", type: "integer", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
                { name: "nisn", type: "varchar", length: "50", isUnique: true, isNullable: false },
                { name: "nama_lengkap", type: "varchar", length: "255", isNullable: false },
                { name: "tempat_lahir", type: "varchar", length: "100", isNullable: true },
                { name: "tanggal_lahir", type: "date", isNullable: true },
                { name: "nama_orang_tua_wali", type: "varchar", length: "255", isNullable: true },
                { name: "kelas", type: "varchar", length: "50", isNullable: false },
                { name: "jurusan", type: "varchar", length: "100", isNullable: true },
                { name: "status_kelulusan", type: "varchar", length: "20", default: "'BELUM_DITENTUKAN'", isNullable: false },
                { name: "catatan_admin", type: "text", isNullable: true },
                { name: "foto_siswa_path", type: "varchar", length: "255", isNullable: true },
                { name: "nomor_ijazah", type: "varchar", length: "100", isNullable: true }, // Unique constraint via index for nullable
                { name: "nomor_skhun", type: "varchar", length: "100", isNullable: true },  // Unique constraint via index for nullable
                { name: "nomor_peserta_ujian", type: "varchar", length: "20", isNullable: true },
                { name: "token_skl", type: "varchar", length: "255", isNullable: true }, // Unique constraint via index for nullable
                { name: "created_at", type: "datetime", default: "datetime('now')", isNullable: false },
                { name: "updated_at", type: "datetime", default: "datetime('now')", isNullable: false },
            ],
            // SQLite handles NULLs in UNIQUE constraints as distinct by default.
            // TypeORM's @Index decorator would create these if not directly on column:
            indices: [
                { columnNames: ["nomor_ijazah"], isUnique: true, where: "nomor_ijazah IS NOT NULL" },
                { columnNames: ["nomor_skhun"], isUnique: true, where: "nomor_skhun IS NOT NULL" },
                { columnNames: ["token_skl"], isUnique: true, where: "token_skl IS NOT NULL" },
            ]
        }), true);
        
        // Create MataPelajaran Table
        await queryRunner.createTable(new Table({
            name: "mata_pelajaran",
            columns: [
                { name: "id", type: "integer", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
                { name: "nama_mapel", type: "varchar", length: "255", isUnique: true, isNullable: false },
                { name: "kategori_mapel", type: "varchar", length: "50", isNullable: true }, // UMUM, PILIHAN, MUATAN_LOKAL
                { name: "kelompok_mapel", type: "varchar", length: "100", isNullable: true },
                { name: "urutan_mapel", type: "integer", isNullable: true },
                { name: "created_at", type: "datetime", default: "datetime('now')", isNullable: false },
                { name: "updated_at", type: "datetime", default: "datetime('now')", isNullable: false },
            ]
        }), true);

        // Create NilaiSiswa Table
        await queryRunner.createTable(new Table({
            name: "nilai_siswa",
            columns: [
                { name: "id", type: "integer", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
                { name: "siswa_id", type: "integer", isNullable: true }, // Foreign key
                { name: "mapel_id", type: "integer", isNullable: true }, // Foreign key
                { name: "nilai", type: "real", isNullable: true }, // float/decimal
                { name: "created_at", type: "datetime", default: "datetime('now')", isNullable: false },
                { name: "updated_at", type: "datetime", default: "datetime('now')", isNullable: false },
            ],
            foreignKeys: [
                new TableForeignKey({
                    columnNames: ["siswa_id"],
                    referencedColumnNames: ["id"],
                    referencedTableName: "siswa",
                    onDelete: "CASCADE" // Or "SET NULL" or "RESTRICT" depending on desired behavior
                }),
                new TableForeignKey({
                    columnNames: ["mapel_id"],
                    referencedColumnNames: ["id"],
                    referencedTableName: "mata_pelajaran",
                    onDelete: "CASCADE" // Or "SET NULL" or "RESTRICT"
                })
            ],
            indices: [ // For unique constraint on (siswa_id, mapel_id)
                { columnNames: ["siswa_id", "mapel_id"], isUnique: true }
            ]
        }), true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("nilai_siswa", true, true, true);
        await queryRunner.dropTable("mata_pelajaran", true, true, true);
        await queryRunner.dropTable("siswa", true, true, true);
        await queryRunner.dropTable("pengaturan_sekolah", true, true, true);
    }
}
