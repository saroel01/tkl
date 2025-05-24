import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMataPelajaranTable1748061632611 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "mata_pelajaran" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "nama_mapel" varchar(255) NOT NULL UNIQUE,
                "kelompok_mapel" varchar(100) NULL,
                "urutan_mapel" integer NULL,
                "created_at" datetime NOT NULL DEFAULT (datetime('now')),
                "updated_at" datetime NOT NULL DEFAULT (datetime('now'))
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "mata_pelajaran"`);
    }

}
