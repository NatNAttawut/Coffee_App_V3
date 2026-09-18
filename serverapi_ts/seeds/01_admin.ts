import { Knex } from "knex";
import bcrypt from "bcrypt";

export async function seed(knex: Knex): Promise<void> {
  const passwordHash = await bcrypt.hash("123456", 10);

  await knex("users")
    .where({ email: "admin@example.com" })
    .del();

  await knex("users").insert({
    firstname: "Admin",
    lastname: "System",
    email: "admin@example.com",
    password: passwordHash,
    role: "admin",
    created_at: new Date(),
    updated_at: new Date(),
  });
}