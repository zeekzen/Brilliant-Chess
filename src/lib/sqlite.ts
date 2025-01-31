import Database from "better-sqlite3"
import path from "path"

const dbPath = path.join(process.cwd(), "database", "bugs.sqlite")

const db = new Database(dbPath)

db.exec(`
    create table if not exists bugs (
        id integer primary key,
        name text,
        email text,
        description text not null,
        game text
    );
`)

export default db