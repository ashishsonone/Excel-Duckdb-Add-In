# Excel Add In to run duck db queries

Uses duckdb wasm to run query directly inside Excel (Desktop)
    as Office Javascript Add-in


tested on Excel 2024 Windows 10

function namespace is `EDUCK` (Excel Duck)

Usage - Proof of concept
`=EDUCK.QUERY("SELECT NOW();")`

## TODO
[ ] Return arrays to fill multiple cells
[ ] input ranges / table name so can run queries on that
    `=QUERY("SELECT COUNT(*) FROM t", "t", A1:D10)`
    `=QUERY("SELECT * FROM marks JOIN students on marks.student_id=students.id", "marks", A1:D10, "students", F1:K10)`
[ ] clean up connections after query runs
[ ] How to isolate parallel queries
[ ] Figure out how to work without network location for manifest
[ ] Deploy as a public addin so that one click install

## How to run locally for development
- Run npm run dev-server - this will serve the assets on localhost:3000
    you need to have trusted access to https://localhost
    as excel needs add ins to be served on https

- put manifest.xml to a network folder \\192.168.1.43\AddinCatalog\

- Add this folder locatoin to excel trusted addin
    File -> Options -> Trust Center -> Trust Center Settings -> Trusted Add-in Catalogs
    add the folder location and we're done

- Now, when you load the excel next time.
    Developer -> Add-ins 
    Here you should see "Shared Folder" tab
    and inside it "Excel Duckdb Addin"
    click and it should appear on right side of home ribbon




