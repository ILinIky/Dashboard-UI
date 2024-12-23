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
let rows = document.querySelectorAll('.searchline');

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


typeSearchInput2.addEventListener('input', () => {
 
  const searchText = typeSearchInput2.value.toLowerCase();

  rows.forEach(row => {
    const secondWord = row.querySelectorAll('td')[1]?.textContent.trim().toLowerCase();

    if (secondWord.includes(searchText)) {
      row.classList.remove('hidden');
    } else {
      row.classList.add('hidden');
    }
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const filterButton = document.getElementById("filter-button");
  const filterDropdown = document.getElementById("filter-dropdown");
  const filterOptions = filterDropdown.querySelectorAll("a");

  // Toggle dropdown visibility
  filterButton.addEventListener("click", (event) => {
    event.preventDefault();
    filterDropdown.classList.toggle("hidden");
  });

  // Handle filter selection
  filterOptions.forEach(option => {
    option.addEventListener("click", (event) => {
      event.preventDefault();

      // Update button text with the selected filter
      const selectedFilter = event.target.dataset.filter;
      filterButton.innerHTML = `
        <svg viewBox="0 0 24 24" class="w-4 mr-2 text-gray-400 dark:text-gray-600" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        ${selectedFilter}
        <svg viewBox="0 0 24 24" class="w-4 ml-1.5 text-gray-400 dark:text-gray-600" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      `;

      // Close dropdown
      filterDropdown.classList.add("hidden");
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (event) => {
    if (!filterButton.contains(event.target) && !filterDropdown.contains(event.target)) {
      filterDropdown.classList.add("hidden");
    }
  });
});

