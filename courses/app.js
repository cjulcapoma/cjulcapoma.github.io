document.addEventListener('DOMContentLoaded', () => {
    const boardContainer = document.getElementById('board-container');
    const searchBar = document.getElementById('search-bar');
    let allCourses = [];
    let activePlatform = null;
    let activeCategory = null;
    let activeLanguage = null;
    let activeLevel = null;

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
        'Aprende Scrum': '#60A5FA', /* Blue */
        'Anthropic Academy': '#D97706' /* Amber */
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
    const languageSelect = document.getElementById('filter-language');
    const levelSelect = document.getElementById('filter-level');
    const groupBySelect = document.getElementById('group-by');
    const resultsCounter = document.getElementById('results-counter');

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
    languageSelect.addEventListener('change', (e) => {
        activeLanguage = e.target.value || null;
        renderBoard();
    });
    levelSelect.addEventListener('change', (e) => {
        activeLevel = e.target.value || null;
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
            const matchesLanguage = !activeLanguage || course.idioma === activeLanguage;
            const matchesLevel = !activeLevel || course.nivel === activeLevel;
            const matchesSearch = course.titulo.toLowerCase().includes(searchTerm) ||
                course.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                course.plataforma.toLowerCase().includes(searchTerm);
            return matchesPlatform && matchesCategory && matchesLanguage && matchesLevel && matchesSearch;
        });

        resultsCounter.textContent = `Mostrando ${filteredCourses.length} curso${filteredCourses.length !== 1 ? 's' : ''}`;

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
        linkEl.className = 'card-link';

        // Header with Brand Badge
        const headerEl = document.createElement('div');
        headerEl.className = 'card-header';

        const brandColor = PLATFORM_COLORS[course.plataforma] || '#cbd5e1';

        const badgeEl = document.createElement('div');
        badgeEl.className = 'platform-badge';
        badgeEl.textContent = course.plataforma;
        badgeEl.style.color = brandColor;
        badgeEl.style.borderColor = brandColor;
        badgeEl.style.backgroundColor = hexToRgba(brandColor, 0.15);

        headerEl.appendChild(badgeEl);

        // Body with Title, Description and Meta Tags
        const bodyEl = document.createElement('div');
        bodyEl.className = 'card-body';

        const titleEl = document.createElement('h3');
        titleEl.className = 'card-title';
        titleEl.textContent = course.titulo;

        const descriptionEl = document.createElement('p');
        descriptionEl.className = 'card-description';
        descriptionEl.textContent = course.descripcion || '';

        const metaTagsEl = document.createElement('div');
        metaTagsEl.className = 'card-meta-tags';

        // Role Tag
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

        // Level Tag
        const nivelKey = (course.nivel || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const nivelTag = document.createElement('span');
        nivelTag.className = `meta-tag nivel nivel-${nivelKey}`;
        nivelTag.textContent = course.nivel;

        // Cost Tag
        const costoTag = document.createElement('span');
        costoTag.className = `meta-tag costo costo-${course.costo === 'Gratis' ? 'gratis' : 'depago'}`;
        costoTag.textContent = course.costo;

        // Corporate Email Tag (if applicable)
        if (course.requiere_corporativo) {
            const corpTag = document.createElement('span');
            corpTag.className = 'meta-tag corporate';
            corpTag.innerHTML = '💼 Company Email';
            metaTagsEl.appendChild(corpTag);
        }

        metaTagsEl.appendChild(roleTag);
        metaTagsEl.appendChild(formatTag);
        metaTagsEl.appendChild(langTag);
        metaTagsEl.appendChild(nivelTag);
        metaTagsEl.appendChild(costoTag);

        bodyEl.appendChild(titleEl);
        bodyEl.appendChild(descriptionEl);
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

        // CTA Button (sibling to linkEl, not nested inside)
        const ctaEl = document.createElement('a');
        ctaEl.href = course.url;
        ctaEl.target = '_blank';
        ctaEl.rel = 'noopener noreferrer';
        ctaEl.className = 'card-cta';
        ctaEl.textContent = 'Ir al curso →';

        cardEl.appendChild(linkEl);
        cardEl.appendChild(ctaEl);

        return cardEl;
    }
});
