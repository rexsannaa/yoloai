document.addEventListener('DOMContentLoaded', function() {
    const sortBtn = document.getElementById('sortBtn');
    const sortDropdownContent = document.getElementById('sortDropdownContent');
    const navLinks = document.querySelectorAll('.sidebar-nav li a');

    if (sortBtn && sortDropdownContent) {
        sortBtn.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent click from bubbling to document
            sortDropdownContent.classList.toggle('show');
        });

        // Close dropdown if clicked outside
        document.addEventListener('click', function(event) {
            if (!sortBtn.contains(event.target) && !sortDropdownContent.contains(event.target)) {
                if (sortDropdownContent.classList.contains('show')) {
                    sortDropdownContent.classList.remove('show');
                }
            }
        });

        // Optional: Update sort button text when an option is clicked
        const sortOptions = sortDropdownContent.querySelectorAll('a');
        sortOptions.forEach(option => {
            option.addEventListener('click', function(e) {
                e.preventDefault();
                sortBtn.innerHTML = `排序: ${this.textContent} <i class="fas fa-chevron-down"></i>`;
                sortDropdownContent.classList.remove('show');
            });
        });
    }

    // Handle active state for sidebar navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // e.preventDefault(); // Uncomment if you don't want actual navigation
            navLinks.forEach(nav => nav.parentElement.classList.remove('active'));
            this.parentElement.classList.add('active');

            // Basic expand/collapse for items with arrows (visual only for now)
            const arrow = this.querySelector('.arrow');
            if (arrow) {
                arrow.classList.toggle('fa-chevron-down');
                arrow.classList.toggle('fa-chevron-right');
            }
        });
    });
});