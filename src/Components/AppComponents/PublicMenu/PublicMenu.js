export default class PublicMenu extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    this.$menu = this.querySelector('.public-menu');
    this.$title = this.querySelector('.public-menu__title');
    this.$search = this.querySelector('.public-menu__search');
    this.$currencyBar = this.querySelector('.public-menu__currency');
    this.$content = this.querySelector('.public-menu__content');
    slice.controller.setComponentProps(this, props);
  }

  async init() {
    const search = await slice.build('SearchBar', { sliceId: 'menu-search' });
    this.$search.appendChild(search);

    const currencySwitcher = await slice.build('CurrencySwitcher', { sliceId: 'menu-currency' });
    this.$currencyBar.appendChild(currencySwitcher);

    this.searchQuery = '';

    slice.events.subscribe('search:changed', (query) => {
      this.searchQuery = query;
      this.renderSections();
    });

    slice.events.subscribe('plato:updated', () => this.renderSections());
    slice.events.subscribe('plato:created', () => this.renderSections());
    slice.events.subscribe('categoria:deleted', () => this.renderSections());
    slice.events.subscribe('combos:updated', () => this.renderSections());

    this.renderSections();
  }

  update() {
    this.renderSections();
  }

  async renderSections() {
    const state = slice.context.getState('restaurantContext');
    const categorias = state?.categorias || [];
    const platos = state?.platos || [];
    const combos = state?.combos || [];

    const query = this.searchQuery?.toLowerCase() || '';

    const fragment = document.createDocumentFragment();

    if (combos && combos.length > 0) {
      const section = document.createElement('section');
      section.className = 'public-menu__section';
      section.innerHTML = '<h2 class="public-menu__section-title">Combos</h2><div class="public-menu__combos"></div>';
      const grid = section.querySelector('.public-menu__combos');

      const promises = [];
      combos.forEach((combo) => {
        if (query && !combo.nombre.toLowerCase().includes(query) && !combo.descripcion.toLowerCase().includes(query)) return;
        promises.push(slice.build('ComboCard', { combo }).then(card => {
          grid.appendChild(card);
        }));
      });

      if (promises.length > 0) {
        await Promise.all(promises);
        fragment.appendChild(section);
      }
    }

    const catPromises = categorias.map(async (cat) => {
      let catPlatos = platos.filter(plato => plato.categoriaId === cat.id && plato.disponible !== false);
      if (query) catPlatos = catPlatos.filter(plato =>
        plato.nombre.toLowerCase().includes(query) || plato.descripcion.toLowerCase().includes(query)
      );
      if (catPlatos.length === 0) return null;

      const section = document.createElement('section');
      section.className = 'public-menu__section';
      section.innerHTML = `<h2 class="public-menu__section-title">${cat.nombre}</h2><div class="public-menu__grid"></div>`;
      const grid = section.querySelector('.public-menu__grid');

      await Promise.all(catPlatos.map(async (plato) => {
        const card = await slice.build('PlatoCard', { plato });
        const actionsDiv = card.querySelector('.plato-card__actions');
        const addBtn = document.createElement('button');
        addBtn.className = 'public-menu__add-btn';
        addBtn.textContent = 'Agregar';
        addBtn.addEventListener('click', () => {
          const cart = slice.controller.getComponent('cart-service');
          if (cart) {
            cart.addDish({ id: plato.id, name: plato.nombre, base_price: plato.precioBase });
          }
        });
        actionsDiv.appendChild(addBtn);
        grid.appendChild(card);
      }));

      return section;
    });

    const sections = await Promise.all(catPromises);
    sections.forEach(section => { if (section) fragment.appendChild(section); });

    this.$content.innerHTML = '';
    this.$content.appendChild(fragment);
  }
}

customElements.define('slice-public-menu', PublicMenu);
