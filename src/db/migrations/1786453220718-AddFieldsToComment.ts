import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldsToComment1786453220718 implements MigrationInterface {
    name = 'AddFieldsToComment1786453220718'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "comments" ADD "professor_name" character varying(150) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comments" ADD "rating" integer NOT NULL DEFAULT '5'`);
        await queryRunner.query(`ALTER TABLE "comments" ADD "reason" text`);
        await queryRunner.query(`ALTER TABLE "faculties" ADD CONSTRAINT "UQ_39747c4153c669f1db683e8f231" UNIQUE ("name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "faculties" DROP CONSTRAINT "UQ_39747c4153c669f1db683e8f231"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "reason"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "rating"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "professor_name"`);
        await queryRunner.query(`ALTER TABLE "comments" ADD "description" text NOT NULL`);
    }

}
