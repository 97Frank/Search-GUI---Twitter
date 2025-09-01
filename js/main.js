document.addEventListener('DOMContentLoaded', function () {
    const allWordsInput = document.getElementById('all-words');
    const exactPhraseInput = document.getElementById('exact-phrase');
    const anyWordsInput = document.getElementById('any-words');
    const noneWordsInput = document.getElementById('none-words');
    const hashtagsInput = document.getElementById('hashtags');
    const fromAccountsInput = document.getElementById('from-accounts');
    const toAccountsInput = document.getElementById('to-accounts');
    const mentionAccountsInput = document.getElementById('mention-accounts');
    const sinceDateInput = document.getElementById('since-date');
    const untilDateInput = document.getElementById('until-date');
    const languageSelect = document.getElementById('language');
    const geocodeInput = document.getElementById('geocode');

    const filterLinksCheckbox = document.getElementById('filter-links');
    const filterImagesCheckbox = document.getElementById('filter-images');
    const filterMediaCheckbox = document.getElementById('filter-media');
    const excludeRepliesCheckbox = document.getElementById('exclude-replies');
    const excludeRetweetsCheckbox = document.getElementById('exclude-retweets');
    const filterNativeVideoCheckbox = document.getElementById('filter-native-video');

    const minRetweetsInput = document.getElementById('min-retweets');
    const minLikesInput = document.getElementById('min-likes');
    const minRepliesInput = document.getElementById('min-replies');

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

    const validateHashtags = (value) => {
        if (value.trim() === '') return true;
        return value.split(/\s+/).every(tag => /^#?\w+$/.test(tag));
    };

    const validateGeocode = (value) => {
        if (value.trim() === '') return true;
        return /^-?\d{1,3}\.\d+,-?\d{1,3}\.\d+,(\d+(\.\d+)?)(mi|km)$/.test(value.trim());
    };

    const validateDates = () => {
        if (sinceDateInput.value && untilDateInput.value) {
            return new Date(sinceDateInput.value) <= new Date(untilDateInput.value);
        }
        return true;
    };

    const updateQuery = () => {
        let queryParts = [];

        if (allWordsInput.value.trim() !== '') queryParts.push(sanitizeInput(allWordsInput.value.trim()));
        if (exactPhraseInput.value.trim() !== '') queryParts.push(`"${sanitizeInput(exactPhraseInput.value.trim())}"`);
        if (anyWordsInput.value.trim() !== '') queryParts.push(`(${sanitizeInput(anyWordsInput.value.trim().split(/\s+/).join(' OR '))})`);
        if (noneWordsInput.value.trim() !== '') queryParts.push(noneWordsInput.value.trim().split(/\s+/).map(w => `-${sanitizeInput(w)}`).join(' '));

        if (hashtagsInput.value.trim() !== '' && validateHashtags(hashtagsInput.value.trim())) {
            queryParts.push(hashtagsInput.value.trim().split(/\s+/).map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' '));
            hashtagsError.textContent = '';
        } else if (hashtagsInput.value.trim() !== '') {
            hashtagsError.textContent = 'Invalid hashtag format';
        }

        if (fromAccountsInput.value.trim() !== '') queryParts.push(`(${fromAccountsInput.value.trim().split(/\s+/).map(u => `from:${sanitizeInput(u.replace('@', ''))}`).join(' OR ')})`);
        if (toAccountsInput.value.trim() !== '') queryParts.push(`(${toAccountsInput.value.trim().split(/\s+/).map(u => `to:${sanitizeInput(u.replace('@', ''))}`).join(' OR ')})`);
        if (mentionAccountsInput.value.trim() !== '') queryParts.push(`(${mentionAccountsInput.value.trim().split(/\s+/).map(u => `@${sanitizeInput(u.replace('@', ''))}`).join(' OR ')})`);

        if (sinceDateInput.value !== '') queryParts.push(`since:${sinceDateInput.value}`);
        if (untilDateInput.value !== '') queryParts.push(`until:${untilDateInput.value}`);

        if (!validateDates()) dateError.textContent = 'Until date must be after since date';
        else dateError.textContent = '';

        if (languageSelect.value !== '') queryParts.push(`lang:${languageSelect.value}`);

        if (geocodeInput.value.trim() !== '') {
            if (validateGeocode(geocodeInput.value.trim())) {
                queryParts.push(`geocode:${geocodeInput.value.trim()}`);
                geocodeError.textContent = '';
            } else {
                geocodeError.textContent = 'Invalid geocode format';
            }
        }

        if (filterLinksCheckbox.checked) queryParts.push('filter:links');
        if (filterImagesCheckbox.checked) queryParts.push('filter:images');
        if (filterMediaCheckbox.checked) queryParts.push('filter:media');
        if (filterNativeVideoCheckbox.checked) queryParts.push('filter:native_video');
        if (excludeRepliesCheckbox.checked) queryParts.push('-filter:replies');
        if (excludeRetweetsCheckbox.checked) queryParts.push('-filter:retweets');

        if (minRetweetsInput.value && parseInt(minRetweetsInput.value) > 0) queryParts.push(`min_retweets:${minRetweetsInput.value}`);
        if (minLikesInput.value && parseInt(minLikesInput.value) > 0) queryParts.push(`min_faves:${minLikesInput.value}`);
        if (minRepliesInput.value && parseInt(minRepliesInput.value) > 0) queryParts.push(`min_replies:${minRepliesInput.value}`);

        queryStringElement.textContent = queryParts.join(' ');
    };

    const saveCurrentSearch = () => {
        const queryString = queryStringElement.textContent.trim();
        const queryId = Date.now().toString();
        const queryName = prompt('Enter a name for your search:', queryString.substring(0, 50)) || `Search-${queryId}`;

        const searchParameters = {
            id: queryId,
            allWords: allWordsInput.value.trim(),
            exactPhrase: exactPhraseInput.value.trim(),
            anyWords: anyWordsInput.value.trim(),
            noneWords: noneWordsInput.value.trim(),
            hashtags: hashtagsInput.value.trim(),
            fromAccounts: fromAccountsInput.value.trim(),
            toAccounts: toAccountsInput.value.trim(),
            mentionAccounts: mentionAccountsInput.value.trim(),
            sinceDate: sinceDateInput.value,
            untilDate: untilDateInput.value,
            language: languageSelect.value,
            geocode: geocodeInput.value.trim(),
            filters: {
                filterLinks: filterLinksCheckbox.checked,
                filterImages: filterImagesCheckbox.checked,
                filterMedia: filterMediaCheckbox.checked,
                filterNativeVideo: filterNativeVideoCheckbox.checked,
                excludeReplies: excludeRepliesCheckbox.checked,
                excludeRetweets: excludeRetweetsCheckbox.checked
            },
            engagement: {
                minRetweets: minRetweetsInput.value,
                minLikes: minLikesInput.value,
                minReplies: minRepliesInput.value
            }
        };

        let savedSearches = JSON.parse(localStorage.getItem('savedSearches')) || {};
        savedSearches[queryId] = { name: queryName, params: searchParameters };
        localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
        alert(`Search "${queryName}" saved successfully!`);
    };

    const loadSavedSearches = () => {
        let savedSearches = JSON.parse(localStorage.getItem('savedSearches')) || {};
        savedSearchesList.innerHTML = '';

        if (Object.keys(savedSearches).length === 0) {
            savedSearchesList.innerHTML = '<li>No saved searches.</li>';
            return;
        }

        for (let id in savedSearches) {
            let li = document.createElement('li');
            li.textContent = savedSearches[id].name;
            li.addEventListener('click', () => {
                loadSearchParameters(savedSearches[id].params);
                savedSearchesModal.style.display = 'none';
            });
            savedSearchesList.appendChild(li);
        }
    };

    const loadSearchParameters = (params) => {
        allWordsInput.value = params.allWords;
        exactPhraseInput.value = params.exactPhrase;
        anyWordsInput.value = params.anyWords;
        noneWordsInput.value = params.noneWords;
        hashtagsInput.value = params.hashtags;
        fromAccountsInput.value = params.fromAccounts;
        toAccountsInput.value = params.toAccounts;
        mentionAccountsInput.value = params.mentionAccounts;
        sinceDateInput.value = params.sinceDate;
        untilDateInput.value = params.untilDate;
        languageSelect.value = params.language;
        geocodeInput.value = params.geocode;

        filterLinksCheckbox.checked = params.filters.filterLinks;
        filterImagesCheckbox.checked = params.filters.filterImages;
        filterMediaCheckbox.checked = params.filters.filterMedia;
        filterNativeVideoCheckbox.checked = params.filters.filterNativeVideo;
        excludeRepliesCheckbox.checked = params.filters.excludeReplies;
        excludeRetweetsCheckbox.checked = params.filters.excludeRetweets;

        minRetweetsInput.value = params.engagement.minRetweets;
        minLikesInput.value = params.engagement.minLikes;
        minRepliesInput.value = params.engagement.minReplies;

        updateQuery();
    };

    const inputElements = [
        allWordsInput, exactPhraseInput, anyWordsInput, noneWordsInput, hashtagsInput,
        fromAccountsInput, toAccountsInput, mentionAccountsInput,
        sinceDateInput, untilDateInput, languageSelect, geocodeInput,
        filterLinksCheckbox, filterImagesCheckbox, filterMediaCheckbox,
        excludeRepliesCheckbox, excludeRetweetsCheckbox, filterNativeVideoCheckbox,
        minRetweetsInput, minLikesInput, minRepliesInput
    ];

    inputElements.forEach(el => {
        el.addEventListener('input', updateQuery);
        el.addEventListener('change', updateQuery);
    });

    runSearchButton.addEventListener('click', () => {
        const query = encodeURIComponent(queryStringElement.textContent);
        const twitterSearchURL = `https://twitter.com/search?q=${query}&src=typed_query&f=live`;
        window.open(twitterSearchURL, '_blank');
    });

    saveSearchButton.addEventListener('click', saveCurrentSearch);
    loadSearchesButton.addEventListener('click', () => {
        loadSavedSearches();
        savedSearchesModal.style.display = 'block';
    });

    closeModalButton.addEventListener('click', () => {
        savedSearchesModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === savedSearchesModal) savedSearchesModal.style.display = 'none';
    });

    updateQuery();
});
