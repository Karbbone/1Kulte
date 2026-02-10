import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfilePictureToUser1769200000000 implements MigrationInterface {
  name = 'AddProfilePictureToUser1769200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`profilePicture\` varchar(500) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`profilePicture\``,
    );
  }
}
