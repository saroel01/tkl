import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCatatanSklToSiswaClean1748083071873 implements MigrationInterface {
    name = 'AddCatatanSklToSiswaClean1748083071873'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add the new column 'catatan_skl' to the 'siswa' table
        await queryRunner.query(`ALTER TABLE "siswa" ADD COLUMN "catatan_skl" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // SQLite does not directly support DROP COLUMN easily in older versions.
        // TypeORM typically handles this by:
        // 1. Creating a new table without the column.
        // 2. Copying data from the old table to the new table.
        // 3. Dropping the old table.
        // 4. Renaming the new table to the original table name.
        // For simplicity here, and because a manual check by user might be needed for their specific SQLite version and setup,
        // we'll provide a direct (though potentially problematic for some older SQLite versions without specific PRAGMAs)
        // or rely on TypeORM's higher-level abstractions if it uses them.
        // A common safe approach is to simply comment out the drop or make it a no-op in complex scenarios
        // if the user is expected to manage schema changes carefully.
        // However, for TypeORM generated migrations, it usually creates the table recreation steps.
        // Since I am manually creating this, I will use the simpler ALTER TABLE DROP COLUMN for brevity,
        // assuming modern SQLite or that TypeORM's abstraction handles it.
        // If this fails, the user will need to adjust this 'down' method.
        
        // A more robust 'down' for SQLite would involve table recreation.
        // For now, let's assume a simple scenario or that TypeORM handles the complexity.
        // If a direct "DROP COLUMN" is not available or safe for the user's SQLite version,
        // they might need to manually adjust this or use TypeORM's schema sync features carefully.
        // Given the previous full schema recreation, this is a simplification.
        await queryRunner.query(`CREATE TABLE "temporary_siswa" (
            "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            "nisn" varchar(50) NOT NULL,
            "nama_lengkap" varchar(255) NOT NULL,
            "tempat_lahir" varchar(100),
            "tanggal_lahir" date,
            "nama_orang_tua_wali" varchar(255),
            "kelas" varchar(50) NOT NULL,
            "jurusan" varchar(100),
            "status_kelulusan" varchar CHECK( "status_kelulusan" IN ('LULUS','TIDAK LULUS','PROSES','BELUM_DITENTUKAN') ) NOT NULL DEFAULT ('BELUM_DITENTUKAN'),
            "catatan_admin" text,
            "foto_siswa_path" varchar(255),
            "nomor_ijazah" varchar(100),
            "nomor_skhun" varchar(100),
            "nomor_peserta_ujian" varchar(20),
            "created_at" datetime NOT NULL DEFAULT (datetime('now')),
            "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
            "token_skl" varchar(255)
        )`);
        await queryRunner.query(`INSERT INTO "temporary_siswa" (
            "id", "nisn", "nama_lengkap", "tempat_lahir", "tanggal_lahir", "nama_orang_tua_wali", 
            "kelas", "jurusan", "status_kelulusan", "catatan_admin", "foto_siswa_path", 
            "nomor_ijazah", "nomor_skhun", "nomor_peserta_ujian", "created_at", "updated_at", "token_skl"
            ) SELECT 
            "id", "nisn", "nama_lengkap", "tempat_lahir", "tanggal_lahir", "nama_orang_tua_wali", 
            "kelas", "jurusan", "status_kelulusan", "catatan_admin", "foto_siswa_path", 
            "nomor_ijazah", "nomor_skhun", "nomor_peserta_ujian", "created_at", "updated_at", "token_skl" 
            FROM "siswa"`);
        await queryRunner.query(`DROP TABLE "siswa"`);
        await queryRunner.query(`ALTER TABLE "temporary_siswa" RENAME TO "siswa"`);
        // Recreate indexes (important!)
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_458f5dfcf50249b95e8f75ef54" ON "siswa" ("nisn") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_48587b616536534778c163d528" ON "siswa" ("nomor_ijazah") WHERE nomor_ijazah IS NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_6025a68dc8cfa090a4375348e4" ON "siswa" ("nomor_skhun") WHERE nomor_skhun IS NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a52c46bc3124013c47d1bf5b61" ON "siswa" ("token_skl") WHERE token_skl IS NOT NULL`);
    }
}
