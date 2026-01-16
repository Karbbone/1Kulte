import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTrailAndQcmTables1764341000000 implements MigrationInterface {
    name = 'CreateTrailAndQcmTables1764341000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Table trails
        await queryRunner.query(`CREATE TABLE \`trails\` (\`id\` varchar(36) NOT NULL, \`cultural_place_id\` varchar(36) NULL, \`name\` varchar(255) NOT NULL, \`description\` text NULL, \`durationMinute\` int NULL, \`difficulty\` varchar(50) NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        // Table qcm_questions
        await queryRunner.query(`CREATE TABLE \`qcm_questions\` (\`id\` varchar(36) NOT NULL, \`trail_id\` varchar(36) NULL, \`question\` text NOT NULL, \`image\` varchar(500) NULL, \`point\` int NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        // Table qcm_answers
        await queryRunner.query(`CREATE TABLE \`qcm_answers\` (\`id\` varchar(36) NOT NULL, \`qcm_question_id\` varchar(36) NULL, \`answer\` text NOT NULL, \`isCorrect\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        // Table user_qcm_answers
        await queryRunner.query(`CREATE TABLE \`user_qcm_answers\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(36) NULL, \`qcm_question_id\` varchar(36) NULL, \`qcm_answer_id\` varchar(36) NULL, \`isCorrect\` tinyint NOT NULL DEFAULT 0, \`pointsEarned\` int NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        // Foreign keys
        await queryRunner.query(`ALTER TABLE \`trails\` ADD CONSTRAINT \`FK_trails_cultural_place\` FOREIGN KEY (\`cultural_place_id\`) REFERENCES \`cultural_places\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`qcm_questions\` ADD CONSTRAINT \`FK_qcm_questions_trail\` FOREIGN KEY (\`trail_id\`) REFERENCES \`trails\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`qcm_answers\` ADD CONSTRAINT \`FK_qcm_answers_question\` FOREIGN KEY (\`qcm_question_id\`) REFERENCES \`qcm_questions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_qcm_answers\` ADD CONSTRAINT \`FK_user_qcm_answers_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_qcm_answers\` ADD CONSTRAINT \`FK_user_qcm_answers_question\` FOREIGN KEY (\`qcm_question_id\`) REFERENCES \`qcm_questions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_qcm_answers\` ADD CONSTRAINT \`FK_user_qcm_answers_answer\` FOREIGN KEY (\`qcm_answer_id\`) REFERENCES \`qcm_answers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_qcm_answers\` DROP FOREIGN KEY \`FK_user_qcm_answers_answer\``);
        await queryRunner.query(`ALTER TABLE \`user_qcm_answers\` DROP FOREIGN KEY \`FK_user_qcm_answers_question\``);
        await queryRunner.query(`ALTER TABLE \`user_qcm_answers\` DROP FOREIGN KEY \`FK_user_qcm_answers_user\``);
        await queryRunner.query(`ALTER TABLE \`qcm_answers\` DROP FOREIGN KEY \`FK_qcm_answers_question\``);
        await queryRunner.query(`ALTER TABLE \`qcm_questions\` DROP FOREIGN KEY \`FK_qcm_questions_trail\``);
        await queryRunner.query(`ALTER TABLE \`trails\` DROP FOREIGN KEY \`FK_trails_cultural_place\``);
        await queryRunner.query(`DROP TABLE \`user_qcm_answers\``);
        await queryRunner.query(`DROP TABLE \`qcm_answers\``);
        await queryRunner.query(`DROP TABLE \`qcm_questions\``);
        await queryRunner.query(`DROP TABLE \`trails\``);
    }

}
