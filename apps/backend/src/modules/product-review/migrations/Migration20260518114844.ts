import { Migration } from '@mikro-orm/migrations'

export class Migration20260518114844 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "product_review" (
        "id" text NOT NULL,
        "product_id" text NOT NULL,
        "customer_id" text NULL,
        "customer_name" text NOT NULL,
        "customer_email" text NULL,
        "rating" integer NOT NULL,
        "title" text NOT NULL,
        "body" text NOT NULL,
        "status" text CHECK ("status" IN ('pending', 'approved', 'rejected')) NOT NULL DEFAULT 'pending',
        "verified" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz NULL,
        CONSTRAINT "product_review_pkey" PRIMARY KEY ("id")
      );
    `)
    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_product_review_product_id"
        ON "product_review" ("product_id")
        WHERE "deleted_at" IS NULL;
    `)
    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_product_review_status"
        ON "product_review" ("status")
        WHERE "deleted_at" IS NULL;
    `)
    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_product_review_deleted_at"
        ON "product_review" ("deleted_at")
        WHERE "deleted_at" IS NOT NULL;
    `)
  }

  async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS "product_review" CASCADE;`)
  }
}
