import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableUnique,
} from 'typeorm';

/**
 * Suggested migration for Insurance + reformulated Damage Reports.
 *
 * NOTE: With synchronize:true in non-prod this may already be applied by TypeORM.
 * Use this when moving to production migrations (synchronize:false).
 *
 * WARNING: Reformulates `damage_reports` — backs up / migrates data before running
 * if the old schema already has rows.
 */
export class InsuranceDamageReports1753100000000 implements MigrationInterface {
  name = 'InsuranceDamageReports1753100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "companies"
      ADD COLUMN IF NOT EXISTS "default_tax_percent" float NOT NULL DEFAULT 22
    `);

    // ── insurance_companies ───────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'insurance_companies',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'rut', type: 'varchar', isNullable: true },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // ── insurance_baremes ─────────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'insurance_baremes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'tenant_id', type: 'uuid', isNullable: false },
          { name: 'insurance_company_id', type: 'uuid', isNullable: false },
          { name: 'hour_cost_chapa', type: 'float', isNullable: false },
          { name: 'hour_cost_mecanica', type: 'float', isNullable: false },
          { name: 'hour_cost_pintura', type: 'float', isNullable: true },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        uniques: [
          new TableUnique({
            name: 'UQ_insurance_baremes_tenant_company',
            columnNames: ['tenant_id', 'insurance_company_id'],
          }),
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'insurance_baremes',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedTableName: 'companies',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'insurance_baremes',
      new TableForeignKey({
        columnNames: ['insurance_company_id'],
        referencedTableName: 'insurance_companies',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // ── Reformulate damage_reports ────────────────────────────────────────────
    // Drop old table if exists (destructive — backup first in production).
    await queryRunner.query(`DROP TABLE IF EXISTS "damage_report_items" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "damage_reports" CASCADE`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "damage_reports_status_enum" CASCADE`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "damage_reports_severity_enum" CASCADE`,
    );

    await queryRunner.query(`
      CREATE TYPE "damage_reports_status_enum" AS ENUM (
        'pending_peritaje',
        'approved',
        'rejected',
        'in_repair',
        'delivered'
      )
    `);

    await queryRunner.createTable(
      new Table({
        name: 'damage_reports',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'tenant_id', type: 'uuid', isNullable: false },
          { name: 'vehicle_id', type: 'uuid', isNullable: false },
          { name: 'insurance_company_id', type: 'uuid', isNullable: false },
          { name: 'siniestro_number', type: 'varchar', isNullable: false },
          {
            name: 'status',
            type: 'enum',
            enum: [
              'pending_peritaje',
              'approved',
              'rejected',
              'in_repair',
              'delivered',
            ],
            enumName: 'damage_reports_status_enum',
            default: `'pending_peritaje'`,
          },
          {
            name: 'general_photos',
            type: 'jsonb',
            default: `'[]'`,
          },
          { name: 'observations', type: 'text', isNullable: true },
          { name: 'subtotal_repuestos', type: 'float', default: 0 },
          { name: 'subtotal_chapa', type: 'float', default: 0 },
          { name: 'subtotal_mecanica', type: 'float', default: 0 },
          { name: 'subtotal_pintura', type: 'float', default: 0 },
          { name: 'subtotal', type: 'float', default: 0 },
          { name: 'tax_percent', type: 'float', default: 22 },
          { name: 'tax_amount', type: 'float', default: 0 },
          { name: 'total', type: 'float', default: 0 },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'damage_reports',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedTableName: 'companies',
        referencedColumnNames: ['id'],
      }),
    );

    await queryRunner.createForeignKey(
      'damage_reports',
      new TableForeignKey({
        columnNames: ['vehicle_id'],
        referencedTableName: 'vehicles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'damage_reports',
      new TableForeignKey({
        columnNames: ['insurance_company_id'],
        referencedTableName: 'insurance_companies',
        referencedColumnNames: ['id'],
      }),
    );

    // ── damage_report_items ───────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "damage_report_items_operation_type_enum" AS ENUM (
        'repuesto',
        'chapa',
        'pintura',
        'mecanica',
        'desmontaje_montaje'
      )
    `);

    await queryRunner.createTable(
      new Table({
        name: 'damage_report_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'damage_report_id', type: 'uuid', isNullable: false },
          { name: 'description', type: 'varchar', isNullable: false },
          {
            name: 'operation_type',
            type: 'enum',
            enum: [
              'repuesto',
              'chapa',
              'pintura',
              'mecanica',
              'desmontaje_montaje',
            ],
            enumName: 'damage_report_items_operation_type_enum',
          },
          { name: 'hours_suggested', type: 'float', default: 0 },
          { name: 'unit_price', type: 'float', default: 0 },
          { name: 'supplier_name', type: 'varchar', isNullable: true },
          {
            name: 'item_photos',
            type: 'jsonb',
            default: `'[]'`,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'damage_report_items',
      new TableForeignKey({
        columnNames: ['damage_report_id'],
        referencedTableName: 'damage_reports',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "damage_report_items" CASCADE`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "damage_report_items_operation_type_enum" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "damage_reports" CASCADE`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "damage_reports_status_enum" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "insurance_baremes" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "insurance_companies" CASCADE`,
    );
    await queryRunner.query(`
      ALTER TABLE "companies" DROP COLUMN IF EXISTS "default_tax_percent"
    `);
  }
}
