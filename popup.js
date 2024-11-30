document.addEventListener('DOMContentLoaded', () => {
const showPopup = document.getElementById('showPopup');
const closePopup = document.getElementById('closePopup');
const popup = document.getElementById('popup');
const copySQL = document.getElementById('copySQL');
const sqlCode = document.getElementById('sqlCode');

// Popup anzeigen
showPopup.addEventListener('click', () => {
  popup.style.display = 'flex';
  Prism.highlightElement(sqlCode); // Syntax-Highlighting auf SQL-Code anwenden
});

// Popup schließen
closePopup.addEventListener('click', () => {
  popup.style.display = 'none';
});

// SQL kopieren
copySQL.addEventListener('click', () => {
  const text = sqlCode.textContent;
  navigator.clipboard.writeText(text).then(() => {
    alert('SQL statement copied!');
  }).catch(err => {
    alert('Failed to copy: ' + err);
  });
});

// Schließen des Popups bei Klick außerhalb
window.addEventListener('click', (e) => {
  if (e.target === popup) {
    popup.style.display = 'none';
  }
});
});