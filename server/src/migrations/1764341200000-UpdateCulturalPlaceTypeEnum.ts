import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCulturalPlaceTypeEnum1764341200000
  implements MigrationInterface
{
  name = 'UpdateCulturalPlaceTypeEnum1764341200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing enum constraint
    await queryRunner.query(
      `ALTER TABLE \`cultural_places\` MODIFY \`type\` VARCHAR(50) NOT NULL`,
    );

    // Update enum values to new types (map old values if needed)
    await queryRunner.query(
      `UPDATE \`cultural_places\` SET \`type\` = 'art' WHERE \`type\` IN ('gallery', 'museum')`,
    );
    await queryRunner.query(
      `UPDATE \`cultural_places\` SET \`type\` = 'patrimoine' WHERE \`type\` IN ('monument', 'library')`,
    );
    await queryRunner.query(
      `UPDATE \`cultural_places\` SET \`type\` = 'musique' WHERE \`type\` IN ('concert_hall', 'cinema', 'theater')`,
    );
    await queryRunner.query(
      `UPDATE \`cultural_places\` SET \`type\` = 'art' WHERE \`type\` = 'other'`,
    );

    // Recreate enum with new values
    await queryRunner.query(
      `ALTER TABLE \`cultural_places\` MODIFY \`type\` ENUM('art', 'patrimoine', 'mythe', 'musique') NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert to old enum
    await queryRunner.query(
      `ALTER TABLE \`cultural_places\` MODIFY \`type\` VARCHAR(50) NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE \`cultural_places\` MODIFY \`type\` ENUM('museum', 'theater', 'gallery', 'cinema', 'concert_hall', 'library', 'monument', 'other') NOT NULL DEFAULT 'other'`,
    );
  }
}
