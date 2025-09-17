import * as duckdb from '@duckdb/duckdb-wasm';

export async function initDuckDB() {
  const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

  // Select a bundle based on browser checks
  const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

  const worker_url = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker}");`], {type: 'text/javascript'})
  );

  // Instantiate the asynchronus version of DuckDB-Wasm
  const worker = new Worker(worker_url);
  const logger = new duckdb.ConsoleLogger();

  // return async () => {
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule);
  URL.revokeObjectURL(worker_url);
  return db
  // }
}



function safeDuckValue(val) {
  if (val === null || val === undefined) return null;

  // Handle BigInt (Excel can't serialize BigInt)
  if (typeof val === "bigint") {
    return val.toString(); // preserve full precision
  }

  // Handle JS Date (Excel understands ISO strings better)
  if (val instanceof Date) {
    return val.toISOString(); // e.g. "2025-09-17T12:34:56.000Z"
  }

  // Handle Arrow Decimal (Decimal128 comes as object/TypedArray sometimes)
  if (val && typeof val === "object" && val.toString && /^\d+(\.\d+)?$/.test(val.toString())) {
    return val.toString(); // safe string
  }

  // Default: numbers, strings, booleans are fine
  return val;
}


export function duckdbResultTo2D(result) {
  if (!result) return [["#NORESULT"]];

//   const out = result.toArray().map((row) => row.toJSON());
//   return JSON.stringify(out)

  // Column headers
  const headers = result.schema.fields.map(f => f.name);

  // Rows of data
  const rows = result.toArray().map(row =>
    Object.values(row).map(safeDuckValue)
  );

  // Return [headers + rows] for Excel
  return [headers, ...rows];
}