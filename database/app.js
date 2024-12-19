let db;

// SQL.js initialisieren
(async () => {
    const SQL = await initSqlJs({ locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}` });

    // Datenbank aus "database.sqlite" laden
    try {
        const response = await fetch("database.sqlite");
        const arrayBuffer = await response.arrayBuffer();
        db = new SQL.Database(new Uint8Array(arrayBuffer));
        console.log("Datenbank aus Datei 'database.sqlite' erfolgreich geladen.");
    } catch (error) {
        console.error("Fehler beim Laden der Datenbank aus Datei:", error);
        db = new SQL.Database();
        console.log("Neue Datenbank initialisiert.");

        // Beispiel-Datenbank erstellen
        db.run(`
            CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER);
            INSERT INTO users (name, age) VALUES ('Max', 25), ('Anna', 30);
        `);
        console.log("Beispiel-Datenbank erstellt.");
    }
})();

// SQL-Befehl ausführen
document.getElementById("executeSQL").addEventListener("click", () => {
    const sqlInput = document.getElementById("sqlInput").value;
    const outputDiv = document.getElementById("output");

    try {
        const result = db.exec(sqlInput); // SQL-Befehl ausführen
        outputDiv.innerHTML = formatResult(result);
    } catch (error) {
        outputDiv.innerHTML = `<p style=\"color: red;\">Fehler: ${error.message}</p>`;
    }
});

// Ergebnis formatieren und anzeigen
function formatResult(result) {
    if (result.length === 0) {
        return "<p>Keine Ergebnisse.</p>";
    }

    const table = document.createElement("table");
    table.border = "1";
    const header = document.createElement("tr");

    // Tabellenkopf
    result[0].columns.forEach((column) => {
        const th = document.createElement("th");
        th.textContent = column;
        header.appendChild(th);
    });
    table.appendChild(header);

    // Tabelleninhalte
    result[0].values.forEach((row) => {
        const tr = document.createElement("tr");
        row.forEach((cell) => {
            const td = document.createElement("td");
            td.textContent = cell;
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    return table.outerHTML;
}

// Datenbank speichern und herunterladen
document.getElementById("saveDb").addEventListener("click", () => {
    const binaryArray = db.export(); // Datenbank exportieren
    const blob = new Blob([binaryArray], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "database.sqlite";
    a.click();

    URL.revokeObjectURL(url);
    console.log("Datenbank heruntergeladen.");

    // Datenbank auch im Local Storage speichern
    //localStorage.setItem("savedDatabase", JSON.stringify(Array.from(binaryArray)));
    //console.log("Datenbank im Local Storage gespeichert.");
});

// Datenbank aus Datei laden
document.getElementById("loadDb").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        const SQL = await initSqlJs({ locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}` });
        db = new SQL.Database(new Uint8Array(arrayBuffer));
        console.log("Datenbank erfolgreich geladen.");

        // Datenbank im Local Storage aktualisieren
        localStorage.setItem("savedDatabase", JSON.stringify(Array.from(new Uint8Array(arrayBuffer))));
        console.log("Datenbank im Local Storage aktualisiert.");
    };
    reader.readAsArrayBuffer(file);
});
