document.addEventListener('DOMContentLoaded', function () {
    const allWordsInput = document.getElementById('all-words');
    const hashtagsInput = document.getElementById('hashtags');
    const sinceDateInput = document.getElementById('since-date');
    const untilDateInput = document.getElementById('until-date');
    const geocodeInput = document.getElementById('geocode');
    const queryStringElement = document.getElementById('query-string');
    const runSearchButton = document.getElementById('run-search');
    const saveSearchButton = document.getElementById('save-search');
    const loadSearchesButton = document.getElementById('load-searches');
    const savedSearchesModal = document.getElementById('saved-searches-modal');
    const closeModalButton = document.querySelector('.close-modal');
    const savedSearchesList = document.getElementById('saved-searches-list');
    const dateError = document.getElementById('date-error');
    const geocodeError = document.getElementById('geocode-error');
    const hashtagsError = document.getElementById('hashtags-error');

    const sanitizeInput = (str) => str.replace(/[^a-zA-Z0-9_@#:\-.,\s]/g, '');
    const validateHashtags = (value) => value.trim() === '' || value.split(/\s+/).every(tag => /^#?\w+$/.test(tag));
    const validateGeocode = (value) => value.trim() === '' || /^-?\d{1,3}\.\d+,-?\d{1,3}\.\d+,(\d+(\.\d+)?)(mi|km)$/.test(value.trim());
    const validateDates = () => !sinceDateInput.value || !untilDateInput.value || new Date(sinceDateInput.value) <= new Date(untilDateInput.value);

    const updateQuery = () => {
        let queryParts = [];
        if (allWordsInput.value.trim() !== '') queryParts.push(sanitizeInput(allWordsInput.value.trim()));
        if (hashtagsInput.value.trim() !== '' && validateHashtags(hashtagsInput.value.trim())) {
            queryParts.push(hashtagsInput.value.trim().split(/\s+/).map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' '));
            hashtagsError.textContent = '';
        } else if (hashtagsInput.value.trim() !== '') hashtagsError.textContent = 'Invalid hashtag format';
        if (sinceDateInput.value !== '') queryParts.push(`since:${sinceDateInput.value}`);
        if (untilDateInput.value !== '') queryParts.push(`until:${untilDateInput.value}`);
        if (!validateDates()) dateError.textContent = 'Until date must be after since date'; else dateError.textContent = '';
        if (geocodeInput.value.trim() !== '' && validateGeocode(geocodeInput.value.trim())) {
            queryParts.push(`geocode:${geocodeInput.value.trim()}`);
            geocodeError.textContent = '';
        } else if (geocodeInput.value.trim() !== '') geocodeError.textContent = 'Invalid geocode format';
        queryStringElement.textContent = queryParts.join(' ');
    };

    const saveCurrentSearch = () => {
        const queryString = queryStringElement.textContent.trim();
        const queryId = Date.now().toString();
        const queryName = prompt('Enter a name for your search:', queryString.substring(0, 50)) || `Search-${queryId}`;
        const searchParameters = { allWords: allWordsInput.value.trim(), hashtags: hashtagsInput.value.trim(), sinceDate: sinceDateInput.value, untilDate: untilDateInput.value, geocode: geocodeInput.value.trim() };
        let savedSearches = JSON.parse(localStorage.getItem('savedSearches')) || {};
        savedSearches[queryId] = { name: queryName, params: searchParameters };
        localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
        alert(`Search "${queryName}" saved successfully!`);
    };

    const loadSavedSearches = () => {
        let savedSearches = JSON.parse(localStorage.getItem('savedSearches')) || {};
        savedSearchesList.innerHTML = '';
        if (Object.keys(savedSearches).length === 0) { savedSearchesList.innerHTML = '<li>No saved searches.</li>'; return; }
        for (let id in savedSearches) {
            let li = document.createElement('li');
            li.textContent = savedSearches[id].name;
            li.addEventListener('click', () => { loadSearchParameters(savedSearches[id].params); savedSearchesModal.style.display = 'none'; });
            savedSearchesList.appendChild(li);
        }
    };

    const loadSearchParameters = (params) => {
        allWordsInput.value = params.allWords; hashtagsInput.value = params.hashtags; sinceDateInput.value = params.sinceDate; untilDateInput.value = params.untilDate; geocodeInput.value = params.geocode; updateQuery();
    };

    [allWordsInput, hashtagsInput, sinceDateInput, untilDateInput, geocodeInput].forEach(el => { el.addEventListener('input', updateQuery); el.addEventListener('change', updateQuery); });
    runSearchButton.addEventListener('click', () => { const query = encodeURIComponent(queryStringElement.textContent); window.open(`https://twitter.com/search?q=${query}&src=typed_query&f=live`, '_blank'); });
    saveSearchButton.addEventListener('click', saveCurrentSearch);
    loadSearchesButton.addEventListener('click', () => { loadSavedSearches(); savedSearchesModal.style.display = 'block'; });
    closeModalButton.addEventListener('click', () => savedSearchesModal.style.display = 'none');
    window.addEventListener('click', (event) => { if (event.target === savedSearchesModal) savedSearchesModal.style.display = 'none'; });
    updateQuery();
});