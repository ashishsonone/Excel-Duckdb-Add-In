import * as duckdb from '@duckdb/duckdb-wasm';



let db // : duckdb.AsyncDuckDB;

async function init() {
  const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

  // Select a bundle based on browser checks
  const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

  const worker_url = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker}");`], {type: 'text/javascript'})
  );

  // Instantiate the asynchronus version of DuckDB-Wasm
  const worker = new Worker(worker_url);
  const logger = new duckdb.ConsoleLogger();
  db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  URL.revokeObjectURL(worker_url);
}

init()

function logMessage(msg) {
    const logDiv = document.getElementById("log");
    if (logDiv) {
        logDiv.textContent += msg + "\n";
    }
    console.log(msg); // also logs to console if available
}

// Example:
logMessage("SAY_HELLO successfully registered!");


/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global console, document, Excel, Office */

// The initialize function must be run each time a new page is loaded
Office.onReady(() => {
  document.getElementById("sideload-msg").style.display = "none";
  document.getElementById("app-body").style.display = "flex";
  document.getElementById("run").onclick = run;
});

async function duckTest() {
  const conn = await db.connect()
  const r = await conn.query("SELECT NOW()")
  console.log("success", r.toArray())

  logMessage("success" + r.toArray())
}

export async function run() {
      await duckTest();
}

export async function run2() {
  try {
    await Excel.run(async (context) => {
      /**
       * Insert your Excel code here
       */
      const range = context.workbook.getSelectedRange();

      // Read the range address
      range.load("address");

      // Update the fill color
      range.format.fill.color = "yellow";
      // range.getCell(0, 0)

      await context.sync();
      console.log(`The range address was ${range.address}.`);

      await duckTest();
    });
  } catch (error) {
    console.error(error);
  }
}
