// db.js
// import initSqlJs from 'sql.js/dist/sql-wasm.js';


export async function initDatabase() {
    // Load SQL.js
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });

    let db;

    // Load existing DB from localStorage if available
    const saved = localStorage.getItem("mydb");
    if (saved) {
        const u8arr = new Uint8Array(JSON.parse(saved));
        db = new SQL.Database(u8arr);
    } else {
        db = new SQL.Database();
        db.run("CREATE TABLE test (id INTEGER PRIMARY KEY, message TEXT);");
        db.run("INSERT INTO test (message) VALUES (?);", ["Hello World"]);
        saveDatabase(db);
    }

    return db;
}

export function saveDatabase(db) {
    const binaryArray = db.export();
    localStorage.setItem("mydb", JSON.stringify(Array.from(binaryArray)));
}
