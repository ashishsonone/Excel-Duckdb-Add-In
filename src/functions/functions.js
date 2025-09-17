import { initDuckDB } from './duckdb.js';

let conn;
let LOGS = 'Hello world'

async function init() {
  conn = await initDuckDB()
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

/**
 * Run duck query
 * @customfunction
 * @param {string} query Query to run
 * @returns {string} run query in duckdb.
 */
async function DUCK_QUERY(query) {
    ADD_LOG("query: " + query)
    // Create table and insert data
    //await conn.query("CREATE TABLE if not exists test (id INTEGER, message VARCHAR);");
    //await conn.query("INSERT INTO test VALUES (1, 'Hello'), (2, 'World');");
    
    // Query
    try {
      const res = await conn.query(query);
      return "Success"
    }
    catch(e){
      return e.message
    }

    // console.log(res.toArray());
    // return "1234"
}

/**
 * Get logs
 * @customfunction
 * @returns {string} get logs
 */
async function GET_LOGS(x){
  return LOGS
}

/**
 * Add logs
 * @customfunction
 * @param {string} msg log msg
 * @returns {string} 
 */
async function ADD_LOG(msg){
  LOGS += "\n\r" + msg
  return 'ok'
}


/* global clearInterval, console, setInterval */

/**
 * Add two numbers
 * @customfunction
 * @param {number} first First number
 * @param {number} second Second number
 * @returns {number} The sum of the two numbers.
 */
export function add(first, second) {
  return first + second;
}

/**
 * Displays the current time once a second
 * @customfunction
 * @param {CustomFunctions.StreamingInvocation<string>} invocation Custom function invocation
 */
export function clock(invocation) {
  const timer = setInterval(() => {
    const time = currentTime();
    invocation.setResult(time);
  }, 1000);

  invocation.onCanceled = () => {
    clearInterval(timer);
  };
}

/**
 * Returns the current time
 * @returns {string} String with the current time formatted for the current locale.
 */
export function currentTime() {
  return new Date().toLocaleTimeString();
}

/**
 * Increments a value once a second.
 * @customfunction
 * @param {number} incrementBy Amount to increment
 * @param {CustomFunctions.StreamingInvocation<number>} invocation
 */
export function increment(incrementBy, invocation) {
  let result = 0;
  const timer = setInterval(() => {
    result += incrementBy;
    invocation.setResult(result);
  }, 1000);

  invocation.onCanceled = () => {
    clearInterval(timer);
  };
}

/**
 * Writes a message to console.log().
 * @customfunction LOG
 * @param {string} message String to write.
 * @returns String to write.
 */
export function logMessage(message) {
  console.log(message);

  return message;
}
