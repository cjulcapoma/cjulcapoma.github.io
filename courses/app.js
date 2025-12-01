document.addEventListener('DOMContentLoaded', () => {
    const boardContainer = document.getElementById('board-container');
    const searchBar = document.getElementById('search-bar');
    let allCourses = [];
    let activePlatform = null;
    let activeCategory = null;

    const PLATFORM_COLORS = {
        'YouTube': '#FF5252', /* Lighter Red */
        'Platzi': '#98CA3F',
        'Coursera': '#60A5FA', /* Lighter Blue */
        'Astro Docs': '#FF5D01',
        'Microsoft Learn': '#38BDF8', /* Sky Blue */
        'Google Cloud': '#4285F4',
        'NetAcad': '#22D3EE', /* Cyan */
        'LinkedIn': '#38BDF8', /* Sky Blue */
        'LinkedIn Learning': '#38BDF8', /* Sky Blue */
        'Santander Open Academy': '#F87171', /* Salmon/Soft Red */
        'Google Skills Boost': '#4285F4',
        'Cisco Networking Academy': '#22D3EE', /* Cyan */
        'The Linux Foundation': '#818CF8', /* Indigo/Soft Blue */
        'Oracle University': '#F87171', /* Soft Red (similar to Santander/YouTube but standard for Oracle) */
        'AWS Skill Builder': '#FBBF24', /* Amber/Orange */
        'FinOps': '#2DD4BF', /* Teal */
        'Spring Academy': '#A3E635', /* Lime/Spring Green */
        'DataCamp': '#4ADE80', /* Green */
        'Aprende Scrum': '#60A5FA' /* Blue */
    };

    fetch('data.json')
        .then(response => response.ok ? response.json() : Promise.reject(`HTTP error! status: ${response.status}`))
        .then(courses => {
            allCourses = courses;
            renderFilters();
            renderBoard();
        })
        .catch(error => {
            console.error('Error fetching or parsing courses:', error);
            boardContainer.innerHTML = '<p style="color: #f87171;">Error al cargar los cursos. Revisa la consola para más detalles.</p>';
        });

    const platformSelect = document.getElementById('filter-platform');
    const categorySelect = document.getElementById('filter-category');
    const groupBySelect = document.getElementById('group-by');

    // Event Listeners
    searchBar.addEventListener('input', () => renderBoard());
    platformSelect.addEventListener('change', (e) => {
        activePlatform = e.target.value || null;
        renderBoard();
    });
    categorySelect.addEventListener('change', (e) => {
        activeCategory = e.target.value || null;
        renderBoard();
    });
    groupBySelect.addEventListener('change', () => renderBoard());

    function renderBoard() {
        boardContainer.innerHTML = '';
        const searchTerm = searchBar.value.toLowerCase();
        const groupBy = groupBySelect.value;

        const filteredCourses = allCourses.filter(course => {
            const matchesPlatform = !activePlatform || course.plataforma === activePlatform;
            const matchesCategory = !activeCategory || course.categoria === activeCategory;
            const matchesSearch = course.titulo.toLowerCase().includes(searchTerm) ||
                course.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            return matchesPlatform && matchesCategory && matchesSearch;
        });

        if (filteredCourses.length === 0) {
            boardContainer.innerHTML = '<p>No se encontraron cursos con los filtros seleccionados.</p>';
            return;
        }

        if (groupBy) {
            renderGroupedBoard(filteredCourses, groupBy);
        } else {
            renderFlatBoard(filteredCourses);
        }
    }

    function renderFlatBoard(courses) {
        // Use the existing grid container style by not adding extra wrappers, 
        // but we need to ensure boardContainer has the grid class or style.
        // In CSS #board-container is the grid.
        // However, if we switch between grouped and flat, we need to manage the container's display.
        // The CSS defines #board-container as grid. 
        // For grouped view, we will append blocks that are NOT cards, so we might need to reset display.

        // Actually, better approach:
        // If flat: boardContainer is grid.
        // If grouped: boardContainer is block (containing sections).

        boardContainer.style.display = 'grid';
        boardContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(220px, 1fr))';
        boardContainer.style.gap = '1.25rem';

        courses.forEach(course => {
            const cardEl = createCourseCard(course);
            boardContainer.appendChild(cardEl);
        });
    }

    function renderGroupedBoard(courses, groupByField) {
        boardContainer.style.display = 'block'; // Stack sections vertically

        // Get unique keys for the group
        const keys = [...new Set(courses.map(c => c[groupByField]))].sort();

        keys.forEach(key => {
            const groupCourses = courses.filter(c => c[groupByField] === key);

            if (groupCourses.length === 0) return;

            const sectionEl = document.createElement('div');
            sectionEl.className = 'group-section';

            const headerEl = document.createElement('div');
            headerEl.className = 'group-header';
            headerEl.innerHTML = `
                ${key} 
                <span class="group-count">${groupCourses.length}</span>
            `;

            const gridEl = document.createElement('div');
            gridEl.className = 'group-grid'; // Defined in CSS to match the card grid

            groupCourses.forEach(course => {
                gridEl.appendChild(createCourseCard(course));
            });

            sectionEl.appendChild(headerEl);
            sectionEl.appendChild(gridEl);
            boardContainer.appendChild(sectionEl);
        });
    }

    function renderFilters() {
        // Populate Select Options
        const platforms = [...new Set(allCourses.map(c => c.plataforma))].sort();
        const categories = [...new Set(allCourses.map(c => c.categoria))].sort();

        // Clear existing options (keep first "All")
        platformSelect.innerHTML = '<option value="">Todas</option>';
        categorySelect.innerHTML = '<option value="">Todos</option>';

        platforms.forEach(platform => {
            const option = document.createElement('option');
            option.value = platform;
            option.textContent = platform;
            platformSelect.appendChild(option);
        });

        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
    }

    // Removed setActiveFilterButton as it's no longer needed

    function hexToRgba(hex, alpha) {
        let r = 0, g = 0, b = 0;
        // Handle 3-digit hex
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex.slice(1, 3), 16);
            g = parseInt(hex.slice(3, 5), 16);
            b = parseInt(hex.slice(5, 7), 16);
        }
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function createCourseCard(course) {
        const cardEl = document.createElement('div');
        cardEl.className = 'course-card';

        const linkEl = document.createElement('a');
        linkEl.href = course.url;
        linkEl.target = '_blank';
        linkEl.rel = 'noopener noreferrer';

        // Header with Brand Badge (replacing Logo)
        const headerEl = document.createElement('div');
        headerEl.className = 'card-header';

        const brandColor = PLATFORM_COLORS[course.plataforma] || '#cbd5e1';

        const badgeEl = document.createElement('div');
        badgeEl.className = 'platform-badge';
        badgeEl.textContent = course.plataforma;
        badgeEl.style.color = brandColor;
        badgeEl.style.borderColor = brandColor;
        badgeEl.style.backgroundColor = hexToRgba(brandColor, 0.15); // Added background color

        headerEl.appendChild(badgeEl);

        // Body with Title and Meta Tags
        const bodyEl = document.createElement('div');
        bodyEl.className = 'card-body';

        const titleEl = document.createElement('h3');
        titleEl.className = 'card-title';
        titleEl.textContent = course.titulo;

        const metaTagsEl = document.createElement('div');
        metaTagsEl.className = 'card-meta-tags';

        // Role Tag (formerly Category)
        const roleTag = document.createElement('span');
        roleTag.className = 'meta-tag category';
        roleTag.textContent = course.categoria;

        // Format Tag
        const formatTag = document.createElement('span');
        formatTag.className = 'meta-tag format';
        formatTag.textContent = course.formato;

        // Language Tag
        const langTag = document.createElement('span');
        langTag.className = 'meta-tag language';
        langTag.textContent = course.idioma;

        // Corporate Email Tag (if applicable)
        if (course.requiere_corporativo) {
            const corpTag = document.createElement('span');
            corpTag.className = 'meta-tag corporate';
            // Briefcase icon + text
            corpTag.innerHTML = '💼 Company Email';
            metaTagsEl.appendChild(corpTag);
        }

        // Note: Platform tag removed from body as it is now the header badge
        metaTagsEl.appendChild(roleTag);
        metaTagsEl.appendChild(formatTag);
        metaTagsEl.appendChild(langTag);

        bodyEl.appendChild(titleEl);
        bodyEl.appendChild(metaTagsEl);

        // Footer with Topic Tags
        const footerEl = document.createElement('div');
        footerEl.className = 'card-footer';

        course.tags.forEach(tag => {
            const tagEl = document.createElement('span');
            tagEl.className = 'card-tag';
            tagEl.textContent = tag;
            footerEl.appendChild(tagEl);
        });

        linkEl.appendChild(headerEl);
        linkEl.appendChild(bodyEl);
        linkEl.appendChild(footerEl);
        cardEl.appendChild(linkEl);

        return cardEl;
    }
});
