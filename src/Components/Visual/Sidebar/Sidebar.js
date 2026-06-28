export default class Sidebar extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    this.$toggle = this.querySelector('.sidebar__toggle');
    this.$toggleText = this.querySelector('.sidebar__toggle-text');
    this.$toggleIcon = this.querySelector('.sidebar__toggle-icon');
    this.$mobileBtn = this.querySelector('.sidebar__mobile-btn');
    this.$overlay = this.querySelector('.sidebar__overlay');
    this.$links = this.querySelector('.sidebar__links');
    this.$inner = this.querySelector('.sidebar__inner');
    slice.controller.setComponentProps(this, props);
  }

  async init() {
    const items = [
      { text: 'Panel Admin', path: '/',
        icon: 'M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5Zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5ZM4 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4Zm10-2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-6Z' },
      { text: 'Men\u00FA', path: '/menu/demo',
        icon: 'M4 6h16M4 12h16M4 18h12' },
      { text: 'Finanzas', path: '/finanzas',
        icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
    ];

    for (const item of items) {
      const li = document.createElement('li');
      const btn = document.createElement('div');
      btn.className = 'sidebar__item';
      btn.setAttribute('data-path', item.path);

      const iconWrap = document.createElement('div');
      iconWrap.className = 'sidebar__icon-wrap';
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '2');
      svg.innerHTML = `<path d="${item.icon}"/>`;
      iconWrap.appendChild(svg);

      const label = document.createElement('span');
      label.className = 'sidebar__item-text';
      label.textContent = item.text;

      btn.appendChild(iconWrap);
      btn.appendChild(label);
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        slice.router.navigate(item.path);
        this.closeMobile();
      });

      li.appendChild(btn);
      this.$links.appendChild(li);
    }

    this.updateActive();
    slice.events.subscribe('router:change', () => this.updateActive());

    const saved = localStorage.getItem('sidebar:collapsed');
    if (saved === 'true') this.classList.add('sidebar--collapsed');

    this.$toggle.addEventListener('click', () => {
      this.classList.toggle('sidebar--collapsed');
      const collapsed = this.classList.contains('sidebar--collapsed');
      localStorage.setItem('sidebar:collapsed', collapsed);
      this.$toggle.title = collapsed ? 'Expandir menú' : 'Colapsar menú';
      window.dispatchEvent(new CustomEvent('sidebar:toggle', { detail: { collapsed } }));
    });

    this.$mobileBtn.addEventListener('click', () => this.openMobile());
    this.$overlay.addEventListener('click', () => this.closeMobile());

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.closeMobile();
    });
  }

  updateActive() {
    const current = window.location.pathname;
    this.querySelectorAll('.sidebar__item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-path') === current);
    });
  }

  openMobile() {
    this.classList.add('sidebar--open');
  }

  closeMobile() {
    this.classList.remove('sidebar--open');
  }
}

customElements.define('slice-sidebar', Sidebar);
