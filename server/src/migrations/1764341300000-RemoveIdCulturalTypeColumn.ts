import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveIdCulturalTypeColumn1764341300000
  implements MigrationInterface
{
  name = 'RemoveIdCulturalTypeColumn1764341300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove idCulturalType column
    await queryRunner.query(
      `ALTER TABLE \`cultural_places\` DROP COLUMN \`idCulturalType\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back idCulturalType column
    await queryRunner.query(
      `ALTER TABLE \`cultural_places\` ADD \`idCulturalType\` varchar(100) NULL`,
    );
  }
}
