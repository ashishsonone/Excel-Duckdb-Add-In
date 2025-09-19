# Excel Add In to run SQL queries using duck db

Uses duckdb wasm to run sql query directly inside Excel (Desktop)
    as Office Javascript Add-in


tested on Excel 2024 Windows 10

Usage - Proof of concept
`=DUCK_SQL("SELECT NOW();")`
`=DUCK_SQL("SELECT COUNT(*) FROM scores", "scores", A1:D7)`
`=DUCK_SQL(E15, "scores", scores, "city", city_info)`
cell E15 = "SELECT Name, State FROM
scores JOIN city
ON scores.City=city.City"
`scores` and `city` are range references (named)



## TODO
- [x] Return arrays to fill multiple cells
- [x] input ranges / table name so can run queries on that
    `=QUERY("SELECT COUNT(*) FROM t", "t", A1:D10)`
    `=QUERY("SELECT * FROM marks JOIN students on marks.student_id=students.id", "marks", A1:D10, "students", F1:K10)`
- [x] clean up connections after query runs
- [x] Isolate parallel queries - uses new schema per query
- [ ] ⚠️ Publish to addin store so that one click install
    this seems pretty complicated. need 365 subscription, partner account and what not
    so skipping for now. 
    Anywas, loading via trusted network location is pretty straighforward.

- [x] clean up files added via db.registerFileText - use db.DropFile()
- [x] Add debug functions - DEBUG_LAST_EXEC_LOGS, DEBUG_TABLES, DEBUG_FILES
- [x] Figure out how to work without network location for manifest
    hack: For now we can just create a network share for a public folder
    so you actually don't need another computer on the network

## prod build
npm run build

host the dist/ files on https endpoint

Deploy using netlify
netlify deploy --dir=dist/ --prod

access at
https://duckex.netlify.app/manifest.xml


## How to run locally for development
- Run `npm run dev-server` - this will serve the assets on localhost:3000
    you need to have trusted access to https://localhost
    as excel needs add ins to be served on https

- put manifest.xml to a network folder \\DESKTOP-IO73HI8\PublicUser\AddinCatalog
    Note: just create a public network share and put manifest in there
    Here I shared "/Users/Public" -> as "PublicUser" share name

- Add this folder locatoin to excel trusted addin
    File -> Options -> Trust Center -> Trust Center Settings -> Trusted Add-in Catalogs
    add the folder location and we're done

- Now, when you load the excel next time.
    Developer -> Add-ins 
    Here you should see "Shared Folder" tab
    and inside it "Excel Duckdb Addin"
    click and it should appear on right side of home ribbon

- clear excel cache
    Remove-Item -Recurse -Force "$env:LOCALAPPDATA\Microsoft\Office\16.0\WEF\*"

## References
### Excel addin tutorial
https://learn.microsoft.com/en-us/office/dev/add-ins/tutorials/excel-tutorial-create-custom-functions?tabs=excel-windows

### a functional addin SQLookup (https://sqlookup.com/)
it uses sqlite internally

Used this as inspiration that something 
like this can be done locally within excel itself

Earlier plan was to run the duckdb on a server 
and use api calls to execute queries

but both privacy and latency wise, running it locally makes
total sense

### Run https local

Microsoft’s Office Add-in tooling can generate and trust dev certificates for you:
`npx office-addin-dev-certs install`

That command:
- Creates a dev cert/key
- Installs them into your OS trust store (so Excel won’t complain as much)
- Stores files you can reuse

once you have those certs you can serve using any http-server
`npx http-server . -S -C C:\Users\<user>\.office-addin-dev-certs\localhost.crt -K C:\Users\<user>\.office-addin-dev-certs\localhost.key -p 3000 -a localhost`

Alternatively, when you use Yeoman scaffolding to setup the project
`npx yo office`
it does it automatically for you

### validate manifest.xml
npx office-addin-manifest validate dist/manifest.xml 
The manifest is valid.

## implemetation notes
duckdb.connect() reuses the connection to same underlying db
so to isolate queries
we create new schema s1, s2, s3 - one for each query
insert data into this schema
and then at the end drop the schema (along with all tables)


