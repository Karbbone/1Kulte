import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImageToReward1769300000000 implements MigrationInterface {
  name = 'AddImageToReward1769300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`rewards\` ADD \`image\` varchar(500) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`rewards\` DROP COLUMN \`image\``,
    );
  }
}
