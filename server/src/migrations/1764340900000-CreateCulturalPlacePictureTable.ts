import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCulturalPlacePictureTable1764340900000 implements MigrationInterface {
    name = 'CreateCulturalPlacePictureTable1764340900000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`cultural_place_pictures\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`path\` varchar(500) NOT NULL, \`mainPicture\` tinyint NOT NULL DEFAULT 0, \`cultural_place_id\` varchar(36) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`cultural_place_pictures\` ADD CONSTRAINT \`FK_cultural_place_pictures_cultural_place\` FOREIGN KEY (\`cultural_place_id\`) REFERENCES \`cultural_places\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cultural_place_pictures\` DROP FOREIGN KEY \`FK_cultural_place_pictures_cultural_place\``);
        await queryRunner.query(`DROP TABLE \`cultural_place_pictures\``);
    }

}
