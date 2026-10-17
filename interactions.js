(() => {
  const lab = document.querySelector('.lab');
  const panels = [...lab.querySelectorAll('.panel')];
  // The live instrument moves into the journey. The archive must never hide it.
  panels.forEach(panel => {
    panel.hidden = false;
    panel.removeAttribute('role');
    panel.removeAttribute('aria-labelledby');
  });
  panels.forEach(panel => {
    panel.classList.remove('reveal', 'scroll-reveal');
    panel.classList.add('visible', 'in-view');
  });
  const footer = document.querySelector('.foot');
  const marker = document.querySelector('.chapter-marker');
  if (footer && marker) {
    const footerObserver = new IntersectionObserver(entries => {
      marker.classList.toggle('footer-visible', entries[0].isIntersecting);
    }, {rootMargin:'0px 0px 80px 0px', threshold:0});
    footerObserver.observe(footer);
  }
})();
