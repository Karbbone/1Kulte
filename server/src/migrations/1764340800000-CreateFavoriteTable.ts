import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFavoriteTable1764340800000 implements MigrationInterface {
    name = 'CreateFavoriteTable1764340800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`favorites\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(36) NULL, \`cultural_place_id\` varchar(36) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`favorites\` ADD CONSTRAINT \`FK_favorites_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`favorites\` ADD CONSTRAINT \`FK_favorites_cultural_place\` FOREIGN KEY (\`cultural_place_id\`) REFERENCES \`cultural_places\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`favorites\` DROP FOREIGN KEY \`FK_favorites_cultural_place\``);
        await queryRunner.query(`ALTER TABLE \`favorites\` DROP FOREIGN KEY \`FK_favorites_user\``);
        await queryRunner.query(`DROP TABLE \`favorites\``);
    }

}
