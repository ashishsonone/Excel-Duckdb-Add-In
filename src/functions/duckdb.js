import * as duckdb from '@duckdb/duckdb-wasm';

// Use the BundlerFileLocator for simplicity
const logger = new duckdb.ConsoleLogger();
const bundle = duckdb.getJsDelivrBundles(); // points to prebuilt WASM files
const worker = new duckdb.AsyncDuckDB(logger);

export async function initDuckDB() {
    await worker.instantiate(bundle.bundler);
    const db = new duckdb.AsyncDuckDB(logger);
    await db.instantiate(bundle.bundler);

    // Create a connection
    const conn = await db.connect();
    return conn;
}

