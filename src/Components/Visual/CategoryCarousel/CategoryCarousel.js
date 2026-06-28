export default class CategoryCarousel extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    this.$container = this.querySelector('.carousel__container');
    slice.controller.setComponentProps(this, props);
  }

  init() {
    this.renderCategories();
    slice.events.subscribe('categoria:created', () => this.renderCategories());
    slice.events.subscribe('categoria:deleted', () => this.renderCategories());
  }

  renderCategories() {
    this.$container.innerHTML = '';
    const state = slice.context.getState('restaurantContext');
    const categorias = state?.categorias || [];

    const allBtn = document.createElement('button');
    allBtn.className = 'carousel__btn carousel__btn--active';
    allBtn.textContent = 'Todas';
    allBtn.dataset.id = '';
    allBtn.addEventListener('click', () => {
      this.$container.querySelectorAll('.carousel__btn').forEach(button => button.classList.remove('carousel__btn--active'));
      allBtn.classList.add('carousel__btn--active');
      slice.events.emit('categoria:selected', null);
    });
    this.$container.appendChild(allBtn);

    categorias.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'carousel__btn';
      btn.textContent = cat.nombre;
      btn.dataset.id = cat.id;
      btn.addEventListener('click', () => {
        this.$container.querySelectorAll('.carousel__btn').forEach(button => button.classList.remove('carousel__btn--active'));
        btn.classList.add('carousel__btn--active');
        slice.events.emit('categoria:selected', cat.id);
      });
      this.$container.appendChild(btn);
    });
  }
}

customElements.define('slice-category-carousel', CategoryCarousel);
