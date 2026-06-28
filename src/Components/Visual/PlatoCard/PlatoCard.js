export default class PlatoCard extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    this.$img = this.querySelector('.plato-card__img');
    this.$nombre = this.querySelector('.plato-card__nombre');
    this.$descripcion = this.querySelector('.plato-card__descripcion');
    this.$precio = this.querySelector('.plato-card__precio');
    this.$disponible = this.querySelector('.plato-card__disponible');
    this.$actions = this.querySelector('.plato-card__actions');
    slice.controller.setComponentProps(this, props);
  }

  init() {
    this.render();
    slice.events.subscribe('currency:changed', () => this.render());
    slice.events.subscribe('rates:updated', () => this.render());
  }

  render() {
    const plato = this.plato;
    if (!plato) return;

    if (plato.imageUrl) {
      this.$img.src = plato.imageUrl;
      this.$img.style.display = 'block';
    } else {
      this.$img.removeAttribute('src');
      this.$img.style.display = 'none';
    }

    this.$nombre.textContent = plato.nombre;
    this.$descripcion.textContent = plato.descripcion;

    const state = slice.context.getState('restaurantContext');
    const baseCurrency = state?.restaurante?.monedaBase || 'USD';
    const selectedCurrency = state?.selectedCurrency || 'USD';
    const rates = state?.exchangeRates || {};

    let precio = plato.precioBase;
    let currency = baseCurrency;

    if (selectedCurrency !== baseCurrency && rates[selectedCurrency]) {
      precio = plato.precioBase * rates[selectedCurrency];
      currency = selectedCurrency;
    }

    this.$precio.textContent = `${precio.toFixed(2)} ${currency}`;
    this.$disponible.textContent = plato.disponible ? 'Disponible' : 'No disponible';
    this.$disponible.className = `plato-card__disponible plato-card__disponible--${plato.disponible ? 'si' : 'no'}`;
  }

  set plato(value) {
    this._plato = value;
    if (this._plato) this.render();
  }

  get plato() {
    return this._plato;
  }
}

customElements.define('slice-plato-card', PlatoCard);
