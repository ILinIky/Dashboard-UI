function splitStatements(sql) {
    // Entferne Zeilenumbrüche und normalisiere die SQL-Anweisung
    const normalizedSQL = sql.replace(/\r\n|\n|\r/g, " ").trim();

    // Regex zur Erkennung von neuen Statements basierend auf Schlüsselwörtern
    const regex = /(WITH\s+.*?AS\s*\(.*?\)\s*(?=INSERT|UPDATE|DELETE|SELECT|WITH|$)|INSERT\s+INTO\s+.*?(?=WITH|INSERT|UPDATE|DELETE|SELECT|$)|UPDATE\s+.*?(?=WITH|INSERT|UPDATE|DELETE|SELECT|$)|DELETE\s+.*?(?=WITH|INSERT|UPDATE|DELETE|SELECT|$)|SELECT\s+.*?(?=WITH|INSERT|UPDATE|DELETE|SELECT|$))/gis;

    const statements = [];
    let match;

    while ((match = regex.exec(normalizedSQL)) !== null) {
        statements.push(match[0].trim());
    }

    // Falls keine Statements gefunden wurden, gesamten SQL-Text als ein Statement behandeln
    if (statements.length === 0 && normalizedSQL.length > 0) {
        statements.push(normalizedSQL);
    }

    return statements;
}

function analyzeStatement(statement) {
    let outputTable = "Nicht gefunden";
    let inputTables = [];
    const cteTables = new Map(); // Map für CTE-Namen und zugrunde liegende Tabellen

    // Erkennung von WITH-Klauseln (CTE)
    const cteRegex = /WITH\s+(\w+)\s+AS\s*\(\s*SELECT[\s\S]*?FROM\s+([\[\]a-zA-Z0-9_.]+).*?\)/gi;
    let cteMatch;
    while ((cteMatch = cteRegex.exec(statement)) !== null) {
        const cteName = cteMatch[1];
        const underlyingTable = cteMatch[2];
        cteTables.set(cteName, underlyingTable);
        inputTables.push(underlyingTable);
    }

    // Erkennung von INSERT INTO
    const insertMatch = statement.match(/INSERT\s+INTO\s+([\[\]a-zA-Z0-9_.]+)/i);
    if (insertMatch) {
        outputTable = insertMatch[1];
    }

    // Erkennung von UPDATE
    const updateMatch = statement.match(/UPDATE\s+([\[\]a-zA-Z0-9_.]+)/i);
    if (updateMatch) {
        outputTable = updateMatch[1];
    }

    // Tabellen aus FROM und JOIN-Klauseln sammeln
    const tableRegex = /(?:FROM|JOIN)\s+([\[\]a-zA-Z0-9_.]+)/gi;
    let tableMatch;
    while ((tableMatch = tableRegex.exec(statement)) !== null) {
        let tableName = tableMatch[1];
        if (cteTables.has(tableName)) {
            // Ersetzen des CTE-Namens durch die zugrunde liegende Tabelle
            tableName = cteTables.get(tableName);
        }
        if (tableName !== outputTable && !inputTables.includes(tableName)) {
            inputTables.push(tableName);
        }
    }

    // Deduplizieren der Input-Tabellen
    inputTables = [...new Set(inputTables)];

    return {
        statement: statement.trim(),
        inputTables: inputTables,
        outputTable: outputTable,
    };
}

function getInputAndOutputTablesForMultiple(sql) {
    const statements = splitStatements(sql);
    return statements.map(analyzeStatement);
}

function parseSQL() {
    const sql = document.getElementById('sqlInput').value;
    const results = getInputAndOutputTablesForMultiple(sql);

    results.forEach((result, index) => {
        console.log(`STATEMENT ${index + 1}`);
        console.log("INPUT: " + (result.inputTables.join(', ') || "Nicht gefunden"));
        console.log("OUTPUT: " + result.outputTable);
    });
}
