import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePengaturanSekolahForSkl1748061414102 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Kolom sudah ada karena synchronize:true sebelumnya. Migrasi ini hanya untuk pencatatan.
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Jika di-rollback, idealnya kolom-kolom ini akan dihapus.
        // Namun, karena 'up' dikosongkan, 'down' juga dikosongkan untuk konsistensi.
        // Jika Anda perlu menghapus kolom ini, lakukan secara manual atau buat migrasi baru.
    }

}
