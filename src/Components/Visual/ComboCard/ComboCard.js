export default class ComboCard extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    this.$name = this.querySelector('.combo-card__name');
    this.$desc = this.querySelector('.combo-card__desc');
    this.$price = this.querySelector('.combo-card__price');
    this.$items = this.querySelector('.combo-card__items');
    this.$btn = this.querySelector('.combo-card__btn');
    this.$actions = this.querySelector('.combo-card__actions');
    slice.controller.setComponentProps(this, props);
  }

  init() {
    if (this._initialized) return;
    this._initialized = true;
    this.render();
    slice.events.subscribe('currency:changed', () => this.render());
    slice.events.subscribe('rates:updated', () => this.render());
    this.$btn.addEventListener('click', () => {
      const cart = slice.controller.getComponent('cart-service');
      if (cart) {
        cart.addCombo({
          id: this.combo.id,
          nombre: this.combo.nombre || this.combo.name,
          totalPrice: this.combo.totalPrice || this.combo.total_price
        });
      }
    });
  }

  render() {
    if (!this.combo) return;
    this.$name.textContent = this.combo.nombre || this.combo.name;
    this.$desc.textContent = this.combo.descripcion || this.combo.description || '';

    const state = slice.context.getState('restaurantContext');
    const baseCurrency = state?.restaurante?.monedaBase || 'USD';
    const selectedCurrency = state?.selectedCurrency || 'USD';
    const rates = state?.exchangeRates || {};

    let price = this.combo.totalPrice || this.combo.total_price || 0;
    let currency = baseCurrency;
    if (selectedCurrency !== baseCurrency && rates[selectedCurrency]) {
      price = parseFloat(price) * rates[selectedCurrency];
      currency = selectedCurrency;
    }
    this.$price.textContent = `${parseFloat(price).toFixed(2)} ${currency}`;

    this.$items.innerHTML = '';
    const items = this.combo.items || [];
    items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'combo-card__item';
      li.textContent = `${item.quantity}x ${item.dishName || item.dish_name || 'Plato'}`;
      this.$items.appendChild(li);
    });
  }

  set combo(value) {
    this._combo = value;
    if (this._combo && this.isConnected) this.render();
  }
  get combo() { return this._combo; }
}

customElements.define('slice-combo-card', ComboCard);
