import { Migration } from '@mikro-orm/migrations';

export class Migration20220404094854 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" drop constraint "user_password_unique";');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" add constraint "user_password_unique" unique ("password");');
  }

}
