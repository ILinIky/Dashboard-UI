function splitStatements(sql) {
    // Entferne Kommentare und normalisiere die SQL-Anweisung
    const normalizedSQL = sql.replace(/--.*$/gm, '') // Einzeilige Kommentare entfernen
                             .replace(/\/\*[\s\S]*?\*\//g, '') // Mehrzeilige Kommentare entfernen
                             .replace(/\r\n|\n|\r/g, ' ') // Zeilenumbrüche durch Leerzeichen ersetzen
                             .replace(/\s+/g, ' ') // Mehrfache Leerzeichen reduzieren
                             .trim();

    // Aufteilen anhand von Semikolons, die das Ende eines Statements markieren
    const rawStatements = normalizedSQL.split(';');

    // Bereinigen und leere Statements entfernen
    const statements = rawStatements.map(stmt => stmt.trim()).filter(stmt => stmt.length > 0);

    return statements;
}

function analyzeStatement(statement) {
    let outputTable = "Nicht gefunden";
    let inputTables = [];
    const cteTables = new Map();

    // Erkennung von WITH-Klauseln (CTE)
    const cteRegex = /WITH\s+(\w+)\s+AS\s*\(([\s\S]+?)\)\s*/gi;
    let cteMatch;
    while ((cteMatch = cteRegex.exec(statement)) !== null) {
        const cteName = cteMatch[1];
        const cteBody = cteMatch[2];
        const underlyingTables = extractTablesFromStatement(cteBody, cteTables);
        cteTables.set(cteName.toLowerCase(), underlyingTables);
        inputTables.push(...underlyingTables);
    }

    // Entferne die WITH-Klausel für die weitere Analyse
    statement = statement.replace(cteRegex, '');

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

    // Erkennung von DELETE
    const deleteMatch = statement.match(/DELETE\s+FROM\s+([\[\]a-zA-Z0-9_.]+)/i);
    if (deleteMatch) {
        outputTable = deleteMatch[1];
    }

    // Extrahiere Tabellen aus dem Statement
    const statementTables = extractTablesFromStatement(statement, cteTables);

    inputTables.push(...statementTables);

    // Entferne die Output-Tabelle aus den Input-Tabellen
    inputTables = inputTables.filter(table => table.toLowerCase() !== outputTable.toLowerCase());

    // Deduplizieren der Input-Tabellen
    inputTables = [...new Set(inputTables.map(table => table.toLowerCase()))];

    return {
        statement: statement.trim(),
        inputTables: inputTables,
        outputTable: outputTable,
    };
}

function extractTablesFromStatement(statement, cteTables) {
    const tables = [];
    const tableRegex = /(?:FROM|JOIN)\s+([\[\]a-zA-Z0-9_.]+)/gi;
    let tableMatch;
    while ((tableMatch = tableRegex.exec(statement)) !== null) {
        let tableName = tableMatch[1];

        // Wenn es sich um eine CTE handelt, füge deren zugrunde liegende Tabellen hinzu
        if (cteTables.has(tableName.toLowerCase())) {
            tables.push(...cteTables.get(tableName.toLowerCase()));
        } else {
            tables.push(tableName);
        }
    }
    return tables;
}

function getInputAndOutputTablesForMultiple(sql) {
    const statements = splitStatements(sql);
    return statements.map(analyzeStatement);
}

function parseSQL() {
    const sql = document.getElementById('sqlInput').value;
    const results = getInputAndOutputTablesForMultiple(sql);

    const resultDiv = document.getElementById('results');
    resultDiv.innerHTML = ''; // Vorherige Ergebnisse löschen

    results.forEach((result, index) => {
        const statementInfo = document.createElement('div');
        statementInfo.innerHTML = `<strong>STATEMENT ${index + 1}</strong><br>
                                   INPUT: ${result.inputTables.join(', ') || "Keine"}<br>
                                   OUTPUT: ${result.outputTable}<br><br>`;
        resultDiv.appendChild(statementInfo);
    });
}
