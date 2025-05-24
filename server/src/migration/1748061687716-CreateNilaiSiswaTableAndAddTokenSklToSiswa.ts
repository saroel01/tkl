import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNilaiSiswaTableAndAddTokenSklToSiswa1748061687716 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Membuat tabel nilai_siswa
        await queryRunner.query(`
            CREATE TABLE "nilai_siswa" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "siswa_id" integer,
                "mapel_id" integer,
                "nilai" real NULL,
                "created_at" datetime NOT NULL DEFAULT (datetime('now')),
                "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
                CONSTRAINT "FK_nilai_siswa_siswa" FOREIGN KEY ("siswa_id") REFERENCES "siswa" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_nilai_siswa_mapel" FOREIGN KEY ("mapel_id") REFERENCES "mata_pelajaran" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "UQ_siswa_mapel" UNIQUE ("siswa_id", "mapel_id")
            )
        `);

        // Menambahkan kolom token_skl ke tabel siswa
        await queryRunner.query(`ALTER TABLE "siswa" ADD COLUMN "token_skl" varchar(255) NULL`);
        // Menambahkan indeks unik untuk token_skl jika tidak NULL (SQLite tidak mendukung WHERE pada ALTER TABLE untuk ADD CONSTRAINT)
        // Indeks ini akan dibuat berdasarkan definisi entitas saat aplikasi berjalan jika belum ada.
        // Atau bisa dibuat manual jika diperlukan: await queryRunner.query(`CREATE UNIQUE INDEX "IDX_siswa_token_skl_unique" ON "siswa" ("token_skl") WHERE "token_skl" IS NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Menghapus kolom token_skl dari tabel siswa
        // Perlu menghapus indeks dulu jika dibuat secara eksplisit di 'up'
        // await queryRunner.query(`DROP INDEX "IDX_siswa_token_skl_unique"`); // Jika indeks dibuat manual di 'up'
        await queryRunner.query(`ALTER TABLE "siswa" DROP COLUMN "token_skl"`); // Ini akan error jika ada constraint, SQLite memerlukan rebuild tabel
        // Untuk SQLite, cara aman drop kolom adalah dengan membuat tabel baru tanpa kolom tsb, copy data, drop tabel lama, rename tabel baru.
        // Namun, untuk migrasi 'down' ini, kita sederhanakan dengan asumsi kolom bisa di-drop langsung atau akan di-handle oleh TypeORM jika entitas diubah.

        // Menghapus tabel nilai_siswa
        await queryRunner.query(`DROP TABLE "nilai_siswa"`);
    }

}
