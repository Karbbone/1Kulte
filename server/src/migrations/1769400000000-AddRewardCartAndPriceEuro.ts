import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRewardCartAndPriceEuro1769400000000 implements MigrationInterface {
  name = 'AddRewardCartAndPriceEuro1769400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`rewards\` MODIFY \`cost\` decimal(10,2) NOT NULL`,
    );

    await queryRunner.query(
      `CREATE TABLE \`reward_carts\` (\`id\` varchar(36) NOT NULL, \`deliveryMode\` enum ('home', 'relay') NOT NULL DEFAULT 'home', \`homeRecipient\` varchar(120) NULL, \`homeAddressLine1\` varchar(255) NULL, \`homeAddressLine2\` varchar(255) NULL, \`homePostalCode\` varchar(20) NULL, \`homeCity\` varchar(120) NULL, \`relayPointName\` varchar(180) NULL, \`relayAddress\` varchar(255) NULL, \`relayOption\` enum ('standard', 'priority') NOT NULL DEFAULT 'standard', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` varchar(36) NULL, UNIQUE INDEX \`IDX_reward_carts_user_id\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );

    await queryRunner.query(
      `CREATE TABLE \`reward_cart_items\` (\`id\` varchar(36) NOT NULL, \`quantity\` int NOT NULL DEFAULT '1', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`cart_id\` varchar(36) NULL, \`reward_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );

    await queryRunner.query(
      `ALTER TABLE \`reward_carts\` ADD CONSTRAINT \`FK_reward_carts_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE \`reward_cart_items\` ADD CONSTRAINT \`FK_reward_cart_items_cart\` FOREIGN KEY (\`cart_id\`) REFERENCES \`reward_carts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE \`reward_cart_items\` ADD CONSTRAINT \`FK_reward_cart_items_reward\` FOREIGN KEY (\`reward_id\`) REFERENCES \`rewards\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`reward_cart_items\` DROP FOREIGN KEY \`FK_reward_cart_items_reward\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`reward_cart_items\` DROP FOREIGN KEY \`FK_reward_cart_items_cart\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`reward_carts\` DROP FOREIGN KEY \`FK_reward_carts_user\``,
    );

    await queryRunner.query(
      `DROP TABLE \`reward_cart_items\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_reward_carts_user_id\` ON \`reward_carts\``,
    );
    await queryRunner.query(
      `DROP TABLE \`reward_carts\``,
    );

    await queryRunner.query(
      `ALTER TABLE \`rewards\` MODIFY \`cost\` int NOT NULL`,
    );
  }
}
