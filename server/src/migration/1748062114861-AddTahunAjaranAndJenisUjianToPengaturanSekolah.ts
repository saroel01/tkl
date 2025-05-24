import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTahunAjaranAndJenisUjianToPengaturanSekolah1748062114861 implements MigrationInterface {
    name = 'AddTahunAjaranAndJenisUjianToPengaturanSekolah1748062114861'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pengaturan_sekolah" ADD COLUMN "tahun_ajaran" varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE "pengaturan_sekolah" ADD COLUMN "jenis_ujian_skl" varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // queryRunner.dropColumn akan menangani kompleksitas penghapusan kolom di SQLite
        await queryRunner.dropColumn('pengaturan_sekolah', 'jenis_ujian_skl');
        await queryRunner.dropColumn('pengaturan_sekolah', 'tahun_ajaran');
    }

}
