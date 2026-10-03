(() => {
  // Preserve the former laundry-product bookmark after the name change.
  if (document.querySelector('#intro-title') && location.hash === '#scks') {
    location.replace('projects/socks/index.html');
    return;
  }
  const root = document.documentElement;
  const themeButton = document.querySelector('#theme-toggle');
  const darkPreference = matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = () => root.dataset.theme || (darkPreference.matches ? 'dark' : 'light');
  const updateThemeLabel = () => themeButton.setAttribute('aria-label', `Switch to ${currentTheme() === 'dark' ? 'light' : 'dark'} mode`);
  updateThemeLabel();
  themeButton.addEventListener('click', () => {
    const theme = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch (_) {}
    updateThemeLabel();
  });
  darkPreference.addEventListener('change', updateThemeLabel);
  document.querySelector('#year').textContent = new Date().getFullYear();

  // Animate entrances without hiding content or making it depend on JavaScript.
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const entrances = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entrances.unobserve(entry.target);
        if (!reducedMotion.matches) {
          entry.target.animate(
            [{ opacity: 0.45, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }],
            { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)' }
          );
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.section-heading, .feature-card, .focus-list li, .principle, .project-row').forEach(element => entrances.observe(element));
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) document.getAnimations().forEach(animation => animation.cancel());
    });
  }

  const search = document.querySelector('#project-search');
  if (!search) return;
  const filters = [...document.querySelectorAll('[data-filter]')];
  const projects = [...document.querySelectorAll('[data-project]')];
  const count = document.querySelector('#result-count');
  const empty = document.querySelector('#empty-results');
  let category = 'all';

  const applyFilters = (updateUrl = true) => {
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    projects.forEach(project => {
      const matchesCategory = category === 'all' || project.dataset.category.split(' ').includes(category);
      const matchesQuery = project.textContent.toLowerCase().includes(query);
      project.hidden = !(matchesCategory && matchesQuery);
      if (!project.hidden) visible++;
    });
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    count.textContent = `${visible} of ${projects.length} projects`;
    empty.hidden = visible > 0;
    if (updateUrl && location.protocol !== 'file:') {
      const url = new URL(location.href);
      category === 'all' ? url.searchParams.delete('category') : url.searchParams.set('category', category);
      query ? url.searchParams.set('q', search.value.trim()) : url.searchParams.delete('q');
      history.replaceState(null, '', url);
    }
  };
  const loadFilters = () => {
    const params = new URLSearchParams(location.search);
    const requested = params.get('category');
    category = filters.some(button => button.dataset.filter === requested) ? requested : 'all';
    search.value = params.get('q') || '';
    applyFilters(false);
  };
  filters.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.filter;
    applyFilters();
  }));
  search.addEventListener('input', () => applyFilters());
  document.querySelector('#clear-filters').addEventListener('click', () => {
    category = 'all';
    search.value = '';
    applyFilters();
    search.focus();
  });
  window.addEventListener('popstate', loadFilters);
  loadFilters();
  document.querySelector('#project-tools').hidden = false;
})();
