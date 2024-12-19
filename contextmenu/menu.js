document.addEventListener('DOMContentLoaded', () => {
  const menuContainer = document.createElement('div');
  document.body.appendChild(menuContainer);

  // Menü aus der HTML-Datei laden
  fetch('contextmenu/menu.html')
    .then(response => response.text())
    .then(data => {
      menuContainer.innerHTML = data;
      const menu = document.querySelector('.menu');

      // Initiale Stile für das Menü
      menu.style.opacity = '0';
      menu.style.pointerEvents = 'none';

      // Rechtsklick-Event
      document.addEventListener('contextmenu', (event) => {
        event.preventDefault();

        const { clientX: mouseX, clientY: mouseY } = event;
        const menuHeight = menu.offsetHeight;
        let topPosition = mouseY - menuHeight;




        // Positioniere das Menü oberhalb des Mauszeigers
        menu.style.top = `${mouseY - menuHeight}px`; // Oberhalb der Maus
        menu.style.left = `${mouseX}px`;

        // Sicherstellen, dass das Menü nicht aus dem sichtbaren Bereich herausragt
        if (topPosition < 0) {
        topPosition = 0; // Setzt es an den oberen Rand
        }

        menu.style.top = `${topPosition}px`;
        menu.style.left = `${mouseX}px`;

        // Menü anzeigen
        menu.style.opacity = '1';
        menu.style.pointerEvents = 'auto';
        
      });

      // Klick außerhalb schließt das Menü
      document.addEventListener('click', () => {
        menu.style.opacity = '0';
        menu.style.pointerEvents = 'none';
      });

      // Feather Icons aktualisieren
      feather.replace();
    })
    .catch(error => console.error('Fehler beim Laden des Menüs:', error));
});
