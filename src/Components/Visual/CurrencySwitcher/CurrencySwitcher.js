export default class CurrencySwitcher extends HTMLElement {
  static props = {
    currencies: { type: 'array', default: ['USD', 'EUR', 'VES', 'COP', 'MXN'], required: false },
  };

  constructor(props) {
    super();
    slice.attachTemplate(this);
    this.$select = this.querySelector('.currency-switcher__select');
    slice.controller.setComponentProps(this, props);
  }

  init() {
    this.renderOptions();
    const state = slice.context.getState('restaurantContext');
    if (state?.selectedCurrency) {
      this.$select.value = state.selectedCurrency;
    }

    this.$select.addEventListener('change', () => {
      slice.events.emit('currency:changed', this.$select.value);
    });

    slice.events.subscribe('currency:changed', (currency) => {
      this.$select.value = currency;
    });
  }

  renderOptions() {
    this.$select.innerHTML = '';
    const currencies = this.currencies || ['USD', 'EUR', 'VES', 'COP', 'MXN'];
    currencies.forEach(currency => {
      const opt = document.createElement('option');
      opt.value = currency;
      opt.textContent = currency;
      this.$select.appendChild(opt);
    });
  }
}

customElements.define('slice-currency-switcher', CurrencySwitcher);
