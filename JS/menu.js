/**
 * Navigation Menu & Mobile Drawer Module
 */
class NavigationMenu {
  constructor() {
    this.header = document.getElementById('main-header');
    this.navMenu = document.getElementById('nav-menu');
    this.toggleBtn = document.getElementById('btn-menu-toggle');
    this.links = document.querySelectorAll('.nav-link');
    this.sections = document.querySelectorAll('section');

    this.init();
  }

  init() {
    this.toggleBtn?.addEventListener('click', () => {
      this.navMenu?.classList.toggle('open');
    });

    this.links.forEach(link => {
      link.addEventListener('click', () => {
        this.navMenu?.classList.remove('open');
      });
    });

    window.addEventListener('scroll', () => {
      this.handleScroll();
    }, { passive: true });
  }

  handleScroll() {
    const scrollY = window.scrollY;
    let currentId = '';

    this.sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    this.links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  }
}

window.NavigationMenu = NavigationMenu;
