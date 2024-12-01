function splitStatements(sql) {
    // Entferne Zeilenumbrüche und normalisiere die SQL-Anweisung
    const normalizedSQL = sql.replace(/\n/g, " ").trim();

    // Aufteilen in Statements, aber WITH-Klauseln und INSERT INTO mit SELECT korrekt zusammenhalten
    const statements = [];
    const regex = /(WITH.*?SELECT.*?FROM.*?(ORDER BY|GROUP BY|LIMIT|;|$)|INSERT\s+INTO\s+\w+\s+SELECT.*?FROM.*?(ORDER BY|GROUP BY|LIMIT|;|$)|(?:UPDATE|DELETE|SELECT).*?(?=(WITH|UPDATE|INSERT|DELETE|SELECT|$)))/gis;
    let match;

    while ((match = regex.exec(normalizedSQL)) !== null) {
        statements.push(match[0].trim());
    }

    return statements;
}


function analyzeStatement(statement) {
    let outputTable = "Nicht gefunden";
    let inputTables = [];

    // Erkennung von WITH-Klauseln (CTE)
    const withMatches = [...statement.matchAll(/WITH\s+\w+\s+AS\s+\(\s*SELECT.*FROM\s+(\w+)/gi)];
    if (withMatches.length > 0) {
        withMatches.forEach(match => inputTables.push(match[1]));
    }

    // Nachfolgendes SELECT in einer CTE
    const cteSelectMatch = statement.match(/FROM\s+(\w+)/gi);
    if (cteSelectMatch) {
        cteSelectMatch.forEach(match => {
            const tableMatch = match.match(/FROM\s+(\w+)/i);
            if (tableMatch && !inputTables.includes(tableMatch[1])) {
                inputTables.push(tableMatch[1]);
            }
        });
    }

    // Erkennung von INSERT INTO
    const insertMatch = statement.match(/INSERT\s+INTO\s+(\w+)/i);
    if (insertMatch) {
        outputTable = insertMatch[1];
        const selectMatch = statement.match(/SELECT.*FROM\s+(\w+)/i);
        if (selectMatch) {
            inputTables.push(selectMatch[1]);
        }
    }

    // Erkennung von UPDATE
    const updateMatch = statement.match(/UPDATE\s+(\w+)/i);
    if (updateMatch) {
        outputTable = updateMatch[1];
    }

    // Erkennung von DELETE
    const deleteMatch = statement.match(/DELETE\s+FROM\s+(\w+)/i);
    if (deleteMatch) {
        outputTable = deleteMatch[1];
    }

    // Erkennung von einfachem SELECT
    const selectMatch = statement.match(/SELECT.*FROM\s+(\w+)/i);
    if (selectMatch && outputTable === "Nicht gefunden") {
        inputTables.push(selectMatch[1]);
    }

    return {
        statement: statement.trim(),
        inputTables: [...new Set(inputTables)],
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
