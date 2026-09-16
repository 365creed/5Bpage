/**
 * Navigation & Responsive Mobile Menu
 */
class NavigationMenu {
  constructor() {
    this.header = document.getElementById('main-header');
    this.navMenu = document.getElementById('nav-menu');
    this.menuToggle = document.getElementById('btn-menu-toggle');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.sections = document.querySelectorAll('section');

    this.init();
  }

  init() {
    this.menuToggle?.addEventListener('click', () => {
      this.navMenu?.classList.toggle('open');
    });

    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.navMenu?.classList.remove('open');
      });
    });

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;

      if (scrollY > 40) {
        this.header.style.padding = '0.75rem 1.5rem';
        this.header.style.background = 'rgba(8, 9, 13, 0.95)';
      } else {
        this.header.style.padding = '1rem 1.5rem';
        this.header.style.background = 'rgba(8, 9, 13, 0.88)';
      }

      let currentId = '';
      this.sections.forEach(sec => {
        const top = sec.offsetTop - 200;
        if (scrollY >= top && scrollY < top + sec.offsetHeight) {
          currentId = sec.getAttribute('id');
        }
      });

      this.navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
      });
    });
  }
}

window.NavigationMenu = NavigationMenu;
