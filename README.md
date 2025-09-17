# Excel Add In to run duck db queries

Uses duckdb wasm to run query directly inside Excel (Desktop)
    as Office Javascript Add-in


tested on Excel 2024 Windows 10

function namespace is `EDUCK` (Excel Duck)

Usage - Proof of concept
`=EDUCK.QUERY("SELECT NOW();")`

TODO
[ ] Return arrays to fill multiple cells
[ ] input ranges / table name so can run queries on that
    `=QUERY("SELECT COUNT(*) FROM t", "t", A1:D10)`
    `=QUERY("SELECT * FROM marks JOIN students on marks.student_id=students.id", "marks", A1:D10, "students", F1:K10)`
[ ] clean up connections after query runs
[ ] How to isolate parallel queries



