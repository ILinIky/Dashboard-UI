document.addEventListener("DOMContentLoaded", () => {
    // First container
    const links1 = document.querySelectorAll(".DatabaseMenu");

    // Second container
    const links2 = document.querySelectorAll(".ActionMenu");

    // Function to handle link clicks
    function handleLinkClick(links, clickedLink) {
        links.forEach(link => {
            // Reset classes for all links
            link.className = "px-3 border-b-2 border-transparent text-gray-600 dark:text-gray-400 pb-1.5";
        });
        // Set the active class for the clicked link
        clickedLink.className = "px-3 border-b-2 border-blue-500 text-blue-500 dark:text-white dark:border-white pb-1.5 active";
    }

    // Add event listeners for the first container
    links1.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            handleLinkClick(links1, link);
        });
    });

    // Add event listeners for the second container
    links2.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            handleLinkClick(links2, link);
        });
    });
});
