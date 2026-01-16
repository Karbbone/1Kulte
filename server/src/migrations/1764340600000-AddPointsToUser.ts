import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPointsToUser1764340600000 implements MigrationInterface {
    name = 'AddPointsToUser1764340600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`points\` int NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`points\``);
    }

}
