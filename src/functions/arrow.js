import * as arrow from "apache-arrow";

export function convertToArrow(values) {
  // First row = headers
  const headers = values[0];
  const rows = values.slice(1);

  // Convert rows into array of objects
  const objects = rows.map((row) => {
    let obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] ?? null;
    });
    return obj;
  });

  // Build Arrow table directly
//   return arrow.tableFromJSON(objects);
  return objects
}