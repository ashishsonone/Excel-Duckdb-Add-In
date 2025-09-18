import { initDuckDB, duckdbResultTo2D } from './duckdb';
import { convertToArrow } from './arrow.js';
import { AsyncDuckDB } from '@duckdb/duckdb-wasm';

/**
 * @customfunction
 */
async function VERSION() {
  return "11:38"
}


let db: AsyncDuckDB; // use db = await dbBuilder()
let LOGS = 'Hello'
const Counter = {
  schema: 0
}

const REGISTERED_FILES : {[k: string]: boolean} = {
}

const DB_TABLES : {[k: string]: {active: boolean, tables: string[]}} = {
}

async function init() {
  db = await initDuckDB()
}

init()

type RangeMap = {
  [x: string]: any[][]
}


async function execDuckQuery(q: string, inputRangeMap: RangeMap) {
  ADD_LOG("exec start")
  const conn = await db.connect()
  ADD_LOG("db connect")

  try {
    return await execDuckQueryCore(db, conn, q, inputRangeMap)
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

async function execDuckQueryCore(db, conn, q, inputRangeMap: RangeMap) {
  const schemaId = Counter.schema
  Counter.schema += 1
  const schemaName = "s" + schemaId

  await conn.query(`CREATE SCHEMA ${schemaName}`)
  await conn.query(`USE ${schemaName}`)
  ADD_LOG("use schema" + schemaName)
  DB_TABLES[schemaName] = {'active' : true, 'tables' : []}

  if (inputRangeMap) {
    for (const alias in inputRangeMap) {
      const range = inputRangeMap[alias]
      const fileName = `${schemaName}.${alias}.json`
      const fullTableName = `${schemaName}.${alias}`

      const jsonRowContent = convertToArrow(range)

      ADD_LOG("rowContent")

      REGISTERED_FILES[fileName] = true

      await db.registerFileText(
          fileName,
          JSON.stringify(jsonRowContent),
      );

      ADD_LOG(`register file ${fileName}`)

      await conn.insertJSONFromPath(fileName, { name: `${alias}`, schema: schemaName });
      ADD_LOG(`insert json ${fileName}`)

      DB_TABLES[schemaName].tables.push(alias)

      await db.dropFile(fileName)
      ADD_LOG(`drop file ${fileName}`)
      // delete PENDING_FILES[fileName]
      REGISTERED_FILES[fileName] = false
    }
    // await db.unregisterFile(fileName);
  }

  // await conn.insertArrowTable(arrowTable, {name: 't'});
  // await conn.insertArrowTable(EOS, { name: 't' });

  ADD_LOG("querying" + q)
  const r = await conn.query(q)
  ADD_LOG("success")
  ADD_LOG("success" + r.toArray())

  await conn.query(`DROP SCHEMA ${schemaName} CASCADE`)
  ADD_LOG("drop schema")
  DB_TABLES[schemaName].active = false

  const x = duckdbResultTo2D(r)
  ADD_LOG("result to 2d")
  return x
}


/**
 * @customfunction
 */
export async function QUERY(query: string, 
    alias1?: string, range1? : any[][],
    alias2?: string, range2? : any[][],
    alias3?: string, range3? : any[][],
    alias4?: string, range4? : any[][],
    alias5?: string, range5? : any[][],
  ): Promise<any[][]> {
    LOGS = '<reset2>'
    
    ADD_LOG("query: " + query)

    // return range
    // Create table and insert data
    //await conn.query("CREATE TABLE if not exists test (id INTEGER, message VARCHAR);");
    //await conn.query("INSERT INTO test VALUES (1, 'Hello'), (2, 'World');");
    
    const inputRangeMap: RangeMap  = {
    }
    if (alias1 && range1) {
      inputRangeMap[alias1] = range1
    }
    if (alias2 && range2) {
      inputRangeMap[alias2] = range2
    }
    if (alias3 && range2) {
      inputRangeMap[alias3] = range3
    }
    if (alias4 && range3) {
      inputRangeMap[alias4] = range4
    }
    if (alias5 && range4) {
      inputRangeMap[alias5] = range5
    }

    // Query
    try {
      const result = await execDuckQuery(query, inputRangeMap)
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
 * Get live table info directly from duckdb tables
 * @customfunction
 * @returns {any[][]} list of tables
 */
async function DEBUG_LIVE_TABLES(){
  return await QUERY("SELECT database_name, schema_name, table_name FROM duckdb_tables")
}

/**
 * Get table history
 * @customfunction
 * @returns {any[][]} list of tables
 */
async function DEBUG_TABLES(){
  const headers = ['Schema', 'Active', 'Table Count', 'Table List']
  const rows = []
  for (const name in DB_TABLES) {
    const info = DB_TABLES[name]
    rows.push([
      name, 
      info.active, 
      info.tables.length, 
      info.tables.join(',')
    ])
  }
  return [headers, ...rows]
}


/**
 * Get registered files history
 * @customfunction
 * @returns {any[][]} list of files
 */
async function DEBUG_FILES() {
  // ADD_LOG("pending files" + PENDING_FILES)

  const headers = ['FileName', 'Active']
  const rows = []
  for (const name in REGISTERED_FILES) {
    rows.push([name, REGISTERED_FILES[name]])
  }
  return [headers, ...rows]
}

async function ADD_LOG(msg){
  LOGS += "\n>>" + msg
  return 'ok'
}
