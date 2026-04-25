// links.js — Search + Category filtering for the magic resource library
(function () {
  window.setupLinksPage = function () {
    var searchInput = document.getElementById('links-search-input');
    var searchClear = document.getElementById('links-search-clear');
    var resultCount = document.getElementById('links-result-count');
    var noResults = document.getElementById('links-no-results');
    var filterBtns = document.querySelectorAll('.links-filter-btn');
    var cards = document.querySelectorAll('.link-card');

    if (!searchInput || !cards.length) return;

    var currentType = 'all';
    var currentQuery = '';

    function updateResults() {
      var q = currentQuery.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var name = (card.dataset.name || '');
        var desc = (card.dataset.desc || '');
        var type = (card.dataset.type || '');
        var matchType = currentType === 'all' || type === currentType;
        var matchQuery = !q || name.indexOf(q) !== -1 || desc.indexOf(q) !== -1;
        if (matchType && matchQuery) {
          card.style.display = '';
          visible++;
        } else {
          card.style.display = 'none';
        }
      });
      if (resultCount) {
        resultCount.textContent = visible + (visible === 1 ? ' resource' : ' resources');
      }
      if (noResults) {
        noResults.style.display = visible === 0 ? 'block' : 'none';
      }
    }

    searchInput.addEventListener('input', function () {
      currentQuery = this.value;
      if (searchClear) {
        searchClear.style.display = currentQuery.length ? 'flex' : 'none';
      }
      updateResults();
    });

    if (searchClear) {
      searchClear.addEventListener('click', function () {
        searchInput.value = '';
        currentQuery = '';
        searchClear.style.display = 'none';
        searchInput.focus();
        updateResults();
      });
    }

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');
        currentType = this.dataset.type;
        updateResults();
      });
    });

    updateResults();
  };
})();
