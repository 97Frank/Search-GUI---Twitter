document.addEventListener('DOMContentLoaded', function () {
    // Input elements
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
    const geocodeInput = document.getElementById('geocode'); // Geocode field added

    // Filter checkboxes
    const filterLinksCheckbox = document.getElementById('filter-links');
    const filterImagesCheckbox = document.getElementById('filter-images');
    const filterMediaCheckbox = document.getElementById('filter-media');
    const excludeRepliesCheckbox = document.getElementById('exclude-replies');
    const excludeRetweetsCheckbox = document.getElementById('exclude-retweets');
    const filterNativeVideoCheckbox = document.getElementById('filter-native-video');

    // Engagement inputs
    const minRetweetsInput = document.getElementById('min-retweets');
    const minLikesInput = document.getElementById('min-likes');
    const minRepliesInput = document.getElementById('min-replies');

    // Query preview and buttons
    const queryStringElement = document.getElementById('query-string');
    const runSearchButton = document.getElementById('run-search');
    const saveSearchButton = document.getElementById('save-search');
    const loadSearchesButton = document.getElementById('load-searches');

    // Modal elements
    const savedSearchesModal = document.getElementById('saved-searches-modal');
    const closeModalButton = document.querySelector('.close-modal');
    const savedSearchesList = document.getElementById('saved-searches-list');

    // Function to update the query string
    const updateQuery = () => {
        let queryParts = [];

        // All of these words
        if (allWordsInput.value.trim() !== '') {
            queryParts.push(allWordsInput.value.trim());
        }

        // Exact phrase
        if (exactPhraseInput.value.trim() !== '') {
            queryParts.push(`"${exactPhraseInput.value.trim()}"`);
        }

        // Any of these words
        if (anyWordsInput.value.trim() !== '') {
            let anyWords = anyWordsInput.value.trim().split(/\s+/).join(' OR ');
            queryParts.push(`(${anyWords})`);
        }

        // None of these words
        if (noneWordsInput.value.trim() !== '') {
            let noneWords = noneWordsInput.value.trim().split(/\s+/).map(word => `-${word}`).join(' ');
            queryParts.push(noneWords);
        }

        // Hashtags
        if (hashtagsInput.value.trim() !== '') {
            let hashtags = hashtagsInput.value.trim().split(/\s+/).map(tag => {
                if (tag.startsWith('#')) {
                    return tag;
                } else {
                    return `#${tag}`;
                }
            }).join(' ');
            queryParts.push(hashtags);
        }

        // From accounts
        if (fromAccountsInput.value.trim() !== '') {
            let fromAccounts = fromAccountsInput.value.trim().split(/\s+/).map(user => {
                let username = user.replace('@', '');
                return `from:${username}`;
            }).join(' OR ');
            queryParts.push(`(${fromAccounts})`);
        }

        // To accounts
        if (toAccountsInput.value.trim() !== '') {
            let toAccounts = toAccountsInput.value.trim().split(/\s+/).map(user => {
                let username = user.replace('@', '');
                return `to:${username}`;
            }).join(' OR ');
            queryParts.push(`(${toAccounts})`);
        }

        // Mentioning accounts
        if (mentionAccountsInput.value.trim() !== '') {
            let mentionAccounts = mentionAccountsInput.value.trim().split(/\s+/).map(user => {
                let username = user.replace('@', '');
                return `@${username}`;
            }).join(' OR ');
            queryParts.push(`(${mentionAccounts})`);
        }

        // Since date
        if (sinceDateInput.value !== '') {
            queryParts.push(`since:${sinceDateInput.value}`);
        }

        // Until date
        if (untilDateInput.value !== '') {
            queryParts.push(`until:${untilDateInput.value}`);
        }

        // Language
        if (languageSelect.value !== '') {
            queryParts.push(`lang:${languageSelect.value}`);
        }

        // Geocode
        if (geocodeInput.value.trim() !== '') {
            queryParts.push(`geocode:${geocodeInput.value.trim()}`);
        }

        // Filters
        if (filterLinksCheckbox.checked) {
            queryParts.push('filter:links');
        }

        if (filterImagesCheckbox.checked) {
            queryParts.push('filter:images');
        }

        if (filterMediaCheckbox.checked) {
            queryParts.push('filter:media');
        }

        if (filterNativeVideoCheckbox.checked) {
            queryParts.push('filter:native_video');
        }

        if (excludeRepliesCheckbox.checked) {
            queryParts.push('-filter:replies');
        }

        if (excludeRetweetsCheckbox.checked) {
            queryParts.push('-filter:retweets');
        }

        // Engagement
        if (minRetweetsInput.value !== '' && parseInt(minRetweetsInput.value) > 0) {
            queryParts.push(`min_retweets:${minRetweetsInput.value}`);
        }

        if (minLikesInput.value !== '' && parseInt(minLikesInput.value) > 0) {
            queryParts.push(`min_faves:${minLikesInput.value}`);
        }

        if (minRepliesInput.value !== '' && parseInt(minRepliesInput.value) > 0) {
            queryParts.push(`min_replies:${minRepliesInput.value}`);
        }

        const queryString = queryParts.join(' ');
        queryStringElement.textContent = queryString;
    };

    // Event listeners for input fields
    const inputElements = [
        allWordsInput,
        exactPhraseInput,
        anyWordsInput,
        noneWordsInput,
        hashtagsInput,
        fromAccountsInput,
        toAccountsInput,
        mentionAccountsInput,
        sinceDateInput,
        untilDateInput,
        languageSelect,
        geocodeInput, // Geocode added here
        filterLinksCheckbox,
        filterImagesCheckbox,
        filterMediaCheckbox,
        excludeRepliesCheckbox,
        excludeRetweetsCheckbox,
        filterNativeVideoCheckbox,
        minRetweetsInput,
        minLikesInput,
        minRepliesInput
    ];

    inputElements.forEach(element => {
        element.addEventListener('input', updateQuery);
        element.addEventListener('change', updateQuery);
    });

    // Event listener for Run Search button
    runSearchButton.addEventListener('click', () => {
        const query = encodeURIComponent(queryStringElement.textContent);
        const twitterSearchURL = `https://twitter.com/search?q=${query}&src=typed_query&f=live`;
        window.open(twitterSearchURL, '_blank');
    });

    // Function to save the current search
    const saveCurrentSearch = () => {
        const queryString = queryStringElement.textContent.trim();
        let queryName = queryString.length <= 17 ? queryString : `${queryString.substring(0, 10)}...${queryString.substring(queryString.length - 7)}`;

        const searchParameters = {
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
            geocode: geocodeInput.value.trim(), // Save geocode
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
        if (savedSearches[queryName]) {
            const overwrite = confirm(`A search named "${queryName}" already exists. Overwrite it?`);
            if (!overwrite) return;
        }
        savedSearches[queryName] = searchParameters;
        localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
        alert(`Search "${queryName}" saved successfully!`);
    };

    // Function to load saved searches
    const loadSavedSearches = () => {
        let savedSearches = JSON.parse(localStorage.getItem('savedSearches')) || {};
        savedSearchesList.innerHTML = '';

        if (Object.keys(savedSearches).length === 0) {
            savedSearchesList.innerHTML = '<li>No saved searches.</li>';
            return;
        }

        for (let name in savedSearches) {
            let li = document.createElement('li');
            li.textContent = name;
            li.addEventListener('click', () => {
                loadSearchParameters(savedSearches[name]);
                savedSearchesModal.style.display = 'none';
            });
            savedSearchesList.appendChild(li);
        }
    };

    // Function to load search parameters into the form
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

    // Event listeners for saving and loading searches
    saveSearchButton.addEventListener('click', saveCurrentSearch);
    loadSearchesButton.addEventListener('click', () => {
        loadSavedSearches();
        savedSearchesModal.style.display = 'block';
    });

    // Event listener for closing the modal
    closeModalButton.addEventListener('click', () => {
        savedSearchesModal.style.display = 'none';
    });

    // Close modal when clicking outside of the modal content
    window.addEventListener('click', (event) => {
        if (event.target === savedSearchesModal) {
            savedSearchesModal.style.display = 'none';
        }
    });

    // Initialize query display
    updateQuery();
});
