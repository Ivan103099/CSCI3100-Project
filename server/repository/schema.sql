CREATE TABLE IF NOT EXISTS "accounts" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "group_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "fullname" TEXT NOT NULL,
    "passhash" TEXT NOT NULL,
    FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "groups" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT
);

CREATE TABLE IF NOT EXISTS "categories" (
    "id" TEXT PRIMARY KEY,
    "group_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL CHECK ("type" IN ("income", "expense")),
    UNIQUE ("group_id", "name", "type"),
    FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE
    FOREIGN KEY ("type") REFERENCES "TYPE"("name") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "transactions" (
    "id" TEXT PRIMARY KEY,
    "account_id" INTEGER NOT NULL,
    "category_id" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "time" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "TYPE" (
    "name" TEXT PRIMARY KEY,
    CHECK ("name" IN ("income", "expense"))
);
