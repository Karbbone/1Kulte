import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCulturalPlaceTable1764340700000 implements MigrationInterface {
    name = 'CreateCulturalPlaceTable1764340700000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`cultural_places\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` text NULL, \`postCode\` varchar(10) NOT NULL, \`city\` varchar(255) NOT NULL, \`idCulturalType\` varchar(100) NULL, \`latitude\` decimal(10,7) NULL, \`longitude\` decimal(10,7) NULL, \`type\` enum ('museum', 'theater', 'gallery', 'cinema', 'concert_hall', 'library', 'monument', 'other') NOT NULL DEFAULT 'other', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`cultural_places\``);
    }

}
