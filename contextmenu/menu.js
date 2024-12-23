document.addEventListener('DOMContentLoaded', () => {
  const menuContainer = document.createElement('div');
  document.body.appendChild(menuContainer);

  let lastClickedElement = null; // Speichert das zuletzt angeklickte Element

  // Menü aus der HTML-Datei laden
  fetch('contextmenu/menu.html')
    .then(response => response.text())
    .then(data => {
      menuContainer.innerHTML = data;
      const menu = document.querySelector('.menu');

     // Initiale Stile für das Menü
     menu.style.position = 'absolute';
     menu.style.opacity = '0';
     menu.style.pointerEvents = 'none';
     menu.style.top = '-9999px'; // Position außerhalb des sichtbaren Bereichs
     menu.style.left = '-9999px'; // Position außerhalb des sichtbaren Bereichs
      
      

      // Rechtsklick-Event
      document.addEventListener('contextmenu', (event) => {
       
        event.preventDefault();

        const { clientX: mouseX, clientY: mouseY } = event;
        const menuHeight = menu.offsetHeight;
        let topPosition = mouseY - menuHeight;


 // Suche nach der übergeordneten searchline
 const searchline = event.target.closest('.searchline');

 if (searchline) {
   // Letztes Element zurücksetzen
   if (lastClickedElement) {
     lastClickedElement.classList.remove('clicked');
   }

   // Aktuelles searchline-Element markieren
   lastClickedElement = searchline;
   lastClickedElement.classList.add('clicked'); // Fügt die Klasse hinzu
 }

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
        lastClickedElement.classList.remove('clicked');
        menu.style.opacity = '0';
        menu.style.pointerEvents = 'none';
      });

      // Feather Icons aktualisieren
      feather.replace();
    })
    .catch(error => console.error('Fehler beim Laden des Menüs:', error));
});
