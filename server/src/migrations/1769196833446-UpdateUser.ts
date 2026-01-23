import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUser1769196833446 implements MigrationInterface {
    name = 'UpdateUser1769196833446'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`qcm_answers\` DROP FOREIGN KEY \`FK_qcm_answers_question\``);
        await queryRunner.query(`ALTER TABLE \`qcm_questions\` DROP FOREIGN KEY \`FK_qcm_questions_trail\``);
        await queryRunner.query(`ALTER TABLE \`trails\` DROP FOREIGN KEY \`FK_trails_cultural_place\``);
        await queryRunner.query(`ALTER TABLE \`user_rewards\` DROP FOREIGN KEY \`FK_user_rewards_reward\``);
        await queryRunner.query(`ALTER TABLE \`user_rewards\` DROP FOREIGN KEY \`FK_user_rewards_user\``);
        await queryRunner.query(`ALTER TABLE \`user_qcm_answers\` DROP FOREIGN KEY \`FK_user_qcm_answers_answer\``);
        await queryRunner.query(`ALTER TABLE \`user_qcm_answers\` DROP FOREIGN KEY \`FK_user_qcm_answers_question\``);
        await queryRunner.query(`ALTER TABLE \`user_qcm_answers\` DROP FOREIGN KEY \`FK_user_qcm_answers_user\``);
        await queryRunner.query(`ALTER TABLE \`favorites\` DROP FOREIGN KEY \`FK_favorites_cultural_place\``);
        await queryRunner.query(`ALTER TABLE \`favorites\` DROP FOREIGN KEY \`FK_favorites_user\``);
        await queryRunner.query(`ALTER TABLE \`cultural_place_pictures\` DROP FOREIGN KEY \`FK_cultural_place_pictures_cultural_place\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`newsletter\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`firstName\` \`firstName\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`lastName\` \`lastName\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`qcm_answers\` ADD CONSTRAINT \`FK_81cf9677ddb3d9f65e7c4dc09bd\` FOREIGN KEY (\`qcm_question_id\`) REFERENCES \`qcm_questions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`qcm_questions\` ADD CONSTRAINT \`FK_faf855e8a95c4f59e213f484483\` FOREIGN KEY (\`trail_id\`) REFERENCES \`trails\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`trails\` ADD CONSTRAINT \`FK_6159b15c1370461f63c5d4d841d\` FOREIGN KEY (\`cultural_place_id\`) REFERENCES \`cultural_places\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_rewards\` ADD CONSTRAINT \`FK_cc6556a0f2fe56932c9187240de\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_rewards\` ADD CONSTRAINT \`FK_2407370386f8e7e2e41cdecef55\` FOREIGN KEY (\`reward_id\`) REFERENCES \`rewards\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_qcm_answers\` ADD CONSTRAINT \`FK_487b61b9f96e10997cca3d58ddb\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_qcm_answers\` ADD CONSTRAINT \`FK_a6d0c8b0d9958270e64d2a92b96\` FOREIGN KEY (\`qcm_question_id\`) REFERENCES \`qcm_questions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_qcm_answers\` ADD CONSTRAINT \`FK_421b472cee5329d0bd685559eef\` FOREIGN KEY (\`qcm_answer_id\`) REFERENCES \`qcm_answers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`favorites\` ADD CONSTRAINT \`FK_35a6b05ee3b624d0de01ee50593\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`favorites\` ADD CONSTRAINT \`FK_fe4926a5a6a53255ecf6f31abaf\` FOREIGN KEY (\`cultural_place_id\`) REFERENCES \`cultural_places\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cultural_place_pictures\` ADD CONSTRAINT \`FK_e154f4253a06efce948b4be6fe1\` FOREIGN KEY (\`cultural_place_id\`) REFERENCES \`cultural_places\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cultural_place_pictures\` DROP FOREIGN KEY \`FK_e154f4253a06efce948b4be6fe1\``);
        await queryRunner.query(`ALTER TABLE \`favorites\` DROP FOREIGN KEY \`FK_fe4926a5a6a53255ecf6f31abaf\``);
        await queryRunner.query(`ALTER TABLE \`favorites\` DROP FOREIGN KEY \`FK_35a6b05ee3b624d0de01ee50593\``);
        await queryRunner.query(`ALTER TABLE \`user_qcm_answers\` DROP FOREIGN KEY \`FK_421b472cee5329d0bd685559eef\``);
        await queryRunner.query(`ALTER TABLE \`user_qcm_answers\` DROP FOREIGN KEY \`FK_a6d0c8b0d9958270e64d2a92b96\``);
        await queryRunner.query(`ALTER TABLE \`user_qcm_answers\` DROP FOREIGN KEY \`FK_487b61b9f96e10997cca3d58ddb\``);
        await queryRunner.query(`ALTER TABLE \`user_rewards\` DROP FOREIGN KEY \`FK_2407370386f8e7e2e41cdecef55\``);
        await queryRunner.query(`ALTER TABLE \`user_rewards\` DROP FOREIGN KEY \`FK_cc6556a0f2fe56932c9187240de\``);
        await queryRunner.query(`ALTER TABLE \`trails\` DROP FOREIGN KEY \`FK_6159b15c1370461f63c5d4d841d\``);
        await queryRunner.query(`ALTER TABLE \`qcm_questions\` DROP FOREIGN KEY \`FK_faf855e8a95c4f59e213f484483\``);
        await queryRunner.query(`ALTER TABLE \`qcm_answers\` DROP FOREIGN KEY \`FK_81cf9677ddb3d9f65e7c4dc09bd\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`lastName\` \`lastName\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`firstName\` \`firstName\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`newsletter\``);
        await queryRunner.query(`ALTER TABLE \`cultural_place_pictures\` ADD CONSTRAINT \`FK_cultural_place_pictures_cultural_place\` FOREIGN KEY (\`cultural_place_id\`) REFERENCES \`cultural_places\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`favorites\` ADD CONSTRAINT \`FK_favorites_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`favorites\` ADD CONSTRAINT \`FK_favorites_cultural_place\` FOREIGN KEY (\`cultural_place_id\`) REFERENCES \`cultural_places\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_qcm_answers\` ADD CONSTRAINT \`FK_user_qcm_answers_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_qcm_answers\` ADD CONSTRAINT \`FK_user_qcm_answers_question\` FOREIGN KEY (\`qcm_question_id\`) REFERENCES \`qcm_questions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_qcm_answers\` ADD CONSTRAINT \`FK_user_qcm_answers_answer\` FOREIGN KEY (\`qcm_answer_id\`) REFERENCES \`qcm_answers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_rewards\` ADD CONSTRAINT \`FK_user_rewards_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_rewards\` ADD CONSTRAINT \`FK_user_rewards_reward\` FOREIGN KEY (\`reward_id\`) REFERENCES \`rewards\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`trails\` ADD CONSTRAINT \`FK_trails_cultural_place\` FOREIGN KEY (\`cultural_place_id\`) REFERENCES \`cultural_places\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`qcm_questions\` ADD CONSTRAINT \`FK_qcm_questions_trail\` FOREIGN KEY (\`trail_id\`) REFERENCES \`trails\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`qcm_answers\` ADD CONSTRAINT \`FK_qcm_answers_question\` FOREIGN KEY (\`qcm_question_id\`) REFERENCES \`qcm_questions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
