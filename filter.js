const filterInput = document.querySelector('.filter-input');
const buttons = document.querySelectorAll('.buttons-container button');

filterInput.addEventListener('input', () => {
  const searchText = filterInput.value.toLowerCase();

  buttons.forEach(button => {
    const textContent = button.textContent.toLowerCase();

    if (textContent.includes(searchText)) {
      // Button einblenden
    
        button.classList.remove('hidden2', 'invisible');
        
        button.classList.add('visible2');
      
     
    } else {
      // Button ausblenden mit Animation
      button.classList.remove('visible2');
      button.classList.add('hidden2');
      // Nach der Animation: display: none setzen
      setTimeout(() => {
        if (button.classList.contains('hidden2')) {
          button.classList.add('invisible');
        }
      }, 300); // Timeout entspricht der CSS-Transition-Dauer
    }
  });
});


const typeSearchInput = document.querySelector('.filter-inputtypesearch');
const rows = document.querySelectorAll('.searchline');

typeSearchInput.addEventListener('input', () => {
 
  const searchText = typeSearchInput.value.toLowerCase();

  rows.forEach(row => {
    const firstWord = row.querySelector('td').textContent.trim().split(' ')[0].toLowerCase();

    if (firstWord.includes(searchText)) {
      row.classList.remove('hidden');
    } else {
      row.classList.add('hidden');
    }
  });
});

const typeSearchInput2 = document.querySelector('.filter-inputwhere');
const rows2 = document.querySelectorAll('.searchline');

typeSearchInput2.addEventListener('input', () => {
 
  const searchText = typeSearchInput2.value.toLowerCase();

  rows2.forEach(row => {
    const secondWord = row.querySelectorAll('td')[1]?.textContent.trim().toLowerCase();

    if (secondWord.includes(searchText)) {
      row.classList.remove('hidden');
    } else {
      row.classList.add('hidden');
    }
  });
});