/**
 * Navigation & Scroll Spy Module
 */
class NavigationMenu {
  constructor() {
    this.header = document.getElementById('main-header');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.sections = document.querySelectorAll('section');

    this.init();
  }

  init() {
    window.addEventListener('scroll', () => {
      this.handleHeaderScroll();
      this.handleScrollSpy();
    });
  }

  handleHeaderScroll() {
    if (window.scrollY > 50) {
      this.header.style.background = 'rgba(10, 12, 16, 0.95)';
      this.header.style.padding = '0.75rem 2rem';
    } else {
      this.header.style.background = 'rgba(10, 12, 16, 0.75)';
      this.header.style.padding = '1rem 2rem';
    }
  }

  handleScrollSpy() {
    let current = '';
    const scrollPos = window.scrollY + 200;

    this.sections.forEach((section) => {
      if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
        current = section.getAttribute('id');
      }
    });

    this.navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }
}

window.NavigationMenu = NavigationMenu;
