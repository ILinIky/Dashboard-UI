function splitStatements(sql) {
    const normalizedSQL = sql.replace(/\r\n|\n|\r/g, " ").trim();

    // Aufteilen in Statements, aber komplexe Anweisungen wie UPDATE mit FROM korrekt behandeln
    const statements = [];
    const regex = /(WITH\s+.*?;)|(INSERT\s+INTO\s+\[?[a-zA-Z0-9_.\[\]]+\]?\s+SELECT.*?;)|(UPDATE\s+\[?[a-zA-Z0-9_.\[\]]+\]?.*?;)|(DELETE.*?;)|(SELECT.*?;)/gis;
    let match;

    while ((match = regex.exec(normalizedSQL + ';')) !== null) {
        if (match[0]) {
            statements.push(match[0].trim().replace(/;$/, ''));
        }
    }

    return statements.length > 0 ? statements : [normalizedSQL];
}

function analyzeStatement(statement) {
    let outputTable = "Nicht gefunden";
    let inputTables = [];
    const cteTables = new Map(); // Map für CTE-Namen und zugrunde liegende Tabellen

    // Erkennung von WITH-Klauseln (CTE)
    const cteRegex = /WITH\s+(\w+)\s+AS\s*\(\s*SELECT[\s\S]+?FROM\s+(\[?[^\]\s]+\]?(?:\.\[?[^\]\s]+\]?)*(?:\.\[?[^\]\s]+\]?)*).*?\)/gi;
    let cteMatch;
    while ((cteMatch = cteRegex.exec(statement)) !== null) {
        const cteName = cteMatch[1];
        const underlyingTable = cteMatch[2];
        cteTables.set(cteName, underlyingTable);
        inputTables.push(underlyingTable);
    }

    // Erkennung von UPDATE
    const updateMatch = statement.match(/UPDATE\s+(\[?[^\]\s]+\]?(?:\.\[?[^\]\s]+\]?)*(?:\.\[?[^\]\s]+\]?)*)(\s|\()/i);
    if (updateMatch) {
        outputTable = updateMatch[1];
    }

    // Tabellen aus FROM und JOIN-Klauseln sammeln
    const tableRegex = /(?:FROM|JOIN)\s+(\[?[^\]\s]+\]?(?:\.\[?[^\]\s]+\]?)*(?:\.\[?[^\]\s]+\]?)*)(?:\s+AS)?/gi;
    let tableMatch;
    while ((tableMatch = tableRegex.exec(statement)) !== null) {
        let tableName = tableMatch[1];
        if (cteTables.has(tableName)) {
            // Ersetzen von CTE durch zugrunde liegende Tabelle
            tableName = cteTables.get(tableName);
        }
        if (!inputTables.includes(tableName)) {
            inputTables.push(tableName);
        }
    }

    // Entferne die Output-Tabelle aus den Input-Tabellen, falls vorhanden
    if (outputTable && inputTables.includes(outputTable)) {
        inputTables = inputTables.filter(table => table !== outputTable);
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
    const statements = splitStatements(sql); // Statements aufteilen
    return statements.map(analyzeStatement); // Jedes Statement analysieren
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
