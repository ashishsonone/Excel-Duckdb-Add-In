import { initDuckDB, duckdbResultTo2D } from './duckdb';
import { convertToArrow } from './arrow.js';

/**
 * @customfunction
 */
async function VERSION() {
  return "21:37"
}


let db; // use db = await dbBuilder()
let LOGS = 'Hello'
const Counter = {
  schema: 0
}

async function init() {
  db = await initDuckDB()
}

init()

/*
// SQL.js - sqlite wasm
import { initDatabase, saveDatabase } from './db.js';

let db;

async function setupDB() {
    db = await initDatabase();
    console.log("Database initialized!");
}

async function addMessage(msg) {
    db.run("INSERT INTO test (message) VALUES (?);", [msg]);
    saveDatabase(db);
}

async function getMessages() {
    const res = db.exec("SELECT * FROM test;");
    if (res.length > 0) {
        return res[0].values.map(row => row[1]); // return message column
    }
    return [];
}

// Example: initialize on taskpane load
setupDB();
*/

// /**
//  * Get last message
//  * @customfunction
//  * @returns {string} The sum of the two numbers.
//  */
// export async function GET_MESSAGES() {
//   const messages = await getMessages();
//   return "msg:" + messages.join(", ");
// }

async function execDuckQuery(q, range) {
  ADD_LOG("exec start")
  const conn = await db.connect()
  ADD_LOG("db connect")

  try {
    return await execDuckQueryCore(db, conn, q, range)
  }
  catch(e){
    ADD_LOG("exec error" + e.message)
    throw e
  }
  finally {
    ADD_LOG("conn closing")
    await conn.close()
    // ADD_LOG("db terminatee")
    // await db.terminate()
  }

}

async function execDuckQueryCore(db, conn, q, range) {
  const schemaId = Counter.schema
  Counter.schema += 1
  const schemaName = "s" + schemaId

  const fileName = `${schemaName}_rows.json`
  
  if (range) {
    const jsonRowContent = convertToArrow(range)

    ADD_LOG("rowContent")

    await db.registerFileText(
        fileName,
        JSON.stringify(jsonRowContent),
    );

    ADD_LOG("register json file")
  }

  await conn.query(`CREATE SCHEMA ${schemaName}`)
  await conn.query(`USE ${schemaName}`)
  ADD_LOG("use schema" + schemaName)

  if (range) {
    await conn.insertJSONFromPath(fileName, { name: `rows`, schema: schemaName });
    ADD_LOG("insert json")

    // await db.unregisterFile(fileName);
  }

  // await conn.insertArrowTable(arrowTable, {name: 't'});
  // await conn.insertArrowTable(EOS, { name: 't' });

  const r = await conn.query(q)
  ADD_LOG("success" + r.toArray())


  await conn.query(`DROP SCHEMA ${schemaName} CASCADE`)
  ADD_LOG("drop schema")

  const x = duckdbResultTo2D(r)
  ADD_LOG("result to 2d")
  return x
}



/**
 * Run duck query
 * @customfunction
 * @param {string} query Query to run
 * @param {any[][]} [Optional] range Excel range to query
 * @returns {any[][]} run query in duckdb.
 */
async function QUERY(query, range) {
    LOGS = '<reset>'
    
    ADD_LOG("query: " + query)
    // return range
    // Create table and insert data
    //await conn.query("CREATE TABLE if not exists test (id INTEGER, message VARCHAR);");
    //await conn.query("INSERT INTO test VALUES (1, 'Hello'), (2, 'World');");
    
    // Query
    try {
      const result = await execDuckQuery(query, range)
      return result
    }
    catch(e){
      ADD_LOG("error" + e.message)
      return [["error" + e.message]]
    }

    // console.log(res.toArray());
    // return "1234"
}

/**
 * Get logs
 * @customfunction
 * @returns {string} get logs
 */
async function DEBUG_LAST_EXEC_LOGS(){
  return LOGS
}

/**
 * Get table info
 * @customfunction
 * @returns {any[][]} run query in duckdb.
 */
async function DEBUG_DB_TABLES(){
  return await QUERY("SELECT database_name, schema_name, table_name FROM duckdb_tables", null)
}



/**
 * Add logs
 * @customfunction
 * @param {string} msg log msg
 * @returns {string} 
 */
async function ADD_LOG(msg){
  LOGS += "\n>>" + msg
  return 'ok'
}


/* global clearInterval, console, setInterval */

// /**
//  * Add two numbers
//  * @customfunction
//  * @param {number} first First number
//  * @param {number} second Second number
//  * @returns {number} The sum of the two numbers.
//  */
// export function add(first, second) {
//   return first + second;
// }

// /**
//  * Displays the current time once a second
//  * @customfunction
//  * @param {CustomFunctions.StreamingInvocation<string>} invocation Custom function invocation
//  */
// export function clock(invocation) {
//   const timer = setInterval(() => {
//     const time = currentTime();
//     invocation.setResult(time);
//   }, 1000);

//   invocation.onCanceled = () => {
//     clearInterval(timer);
//   };
// }

/**
 * Returns the current time
 * @returns {string} String with the current time formatted for the current locale.
 */
export function currentTime() {
  return new Date().toLocaleTimeString();
}

// /**
//  * Increments a value once a second.
//  * @customfunction
//  * @param {number} incrementBy Amount to increment
//  * @param {CustomFunctions.StreamingInvocation<number>} invocation
//  */
// export function increment(incrementBy, invocation) {
//   let result = 0;
//   const timer = setInterval(() => {
//     result += incrementBy;
//     invocation.setResult(result);
//   }, 1000);

//   invocation.onCanceled = () => {
//     clearInterval(timer);
//   };
// }

// /**
//  * Writes a message to console.log().
//  * @customfunction LOG
//  * @param {string} message String to write.
//  * @returns String to write.
//  */
// export function logMessage(message) {
//   console.log(message);

//   return message;
// }
