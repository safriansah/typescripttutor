import { Migration } from '@mikro-orm/migrations';

export class Migration20220404094759 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("id" serial primary key, "username" text not null, "password" text not null, "created_at" timestamptz(0) not null default \'NOW()\', "updated_at" timestamptz(0) null);');
    this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');
    this.addSql('alter table "user" add constraint "user_password_unique" unique ("password");');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "user" cascade;');
  }

}
