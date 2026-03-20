import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUseWalletDiscountToRewardCart1769500000000 implements MigrationInterface {
  name = 'AddUseWalletDiscountToRewardCart1769500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`reward_carts\` ADD \`useWalletDiscount\` tinyint NOT NULL DEFAULT 1`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`reward_carts\` DROP COLUMN \`useWalletDiscount\``,
    );
  }
}
