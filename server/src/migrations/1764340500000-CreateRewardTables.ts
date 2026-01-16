import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRewardTables1764340500000 implements MigrationInterface {
    name = 'CreateRewardTables1764340500000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`rewards\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` text NULL, \`cost\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_rewards\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(36) NULL, \`reward_id\` varchar(36) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user_rewards\` ADD CONSTRAINT \`FK_user_rewards_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_rewards\` ADD CONSTRAINT \`FK_user_rewards_reward\` FOREIGN KEY (\`reward_id\`) REFERENCES \`rewards\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_rewards\` DROP FOREIGN KEY \`FK_user_rewards_reward\``);
        await queryRunner.query(`ALTER TABLE \`user_rewards\` DROP FOREIGN KEY \`FK_user_rewards_user\``);
        await queryRunner.query(`DROP TABLE \`user_rewards\``);
        await queryRunner.query(`DROP TABLE \`rewards\``);
    }

}
