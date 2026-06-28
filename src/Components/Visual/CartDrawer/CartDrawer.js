export default class CartDrawer extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    this.$items = this.querySelector('.cart__items');
    this.$total = this.querySelector('.cart__total');
    this.$count = this.querySelector('.cart__count');
    this.$btn = this.querySelector('.cart__toggle');
    this.$panel = this.querySelector('.cart__panel');
    this.$overlay = this.querySelector('.cart__overlay');
    this.$clearBtn = this.querySelector('.cart__clear');
    this.$checkoutBtn = this.querySelector('.cart__checkout');
    this.$footer = this.querySelector('.cart__footer');
    slice.controller.setComponentProps(this, props);
  }

  init() {
    this.$btn.addEventListener('click', () => this.toggle());
    this.$overlay.addEventListener('click', () => this.close());
    this.$clearBtn.addEventListener('click', () => {
      const cart = slice.controller.getComponent('cart-service');
      if (cart) cart.clear();
    });
    this.$checkoutBtn.addEventListener('click', async () => {
      const cart = slice.controller.getComponent('cart-service');
      if (!cart || cart.items.length === 0) return;
      const order = await cart.checkout();
      if (order) {
        this.close();
        slice.events.emit('modal:open', {
          title: 'Compra realizada',
          content: (() => {
            const div = document.createElement('div');
            div.innerHTML = `<p style="margin:0">Compra realizada por <strong>$${order.total.toFixed(2)}</strong></p>`;
            return div;
          })()
        });
      }
    });

    slice.events.subscribe('cart:updated', () => this.render());
    slice.events.subscribe('currency:changed', () => this.render());
    slice.events.subscribe('rates:updated', () => this.render());
    this.render();
  }

  toggle() {
    this.$panel.classList.toggle('cart__panel--open');
    this.$overlay.classList.toggle('cart__overlay--visible');
  }

  close() {
    this.$panel.classList.remove('cart__panel--open');
    this.$overlay.classList.remove('cart__overlay--visible');
  }

  render() {
    const cart = slice.controller.getComponent('cart-service');
    if (!cart) return;

    const state = slice.context.getState('restaurantContext');
    const baseCurrency = state?.restaurante?.monedaBase || 'USD';
    const selectedCurrency = state?.selectedCurrency || 'USD';
    const rates = state?.exchangeRates || {};
    const rate = (selectedCurrency !== baseCurrency && rates[selectedCurrency]) ? rates[selectedCurrency] : 1;
    const displayCurrency = (rate !== 1) ? selectedCurrency : baseCurrency;

    const items = cart.items || [];
    this.$count.textContent = cart.getCount();

    this.$items.innerHTML = '';
    items.forEach((item, index) => {
      const convertedPrice = item.price * rate;
      const div = document.createElement('div');
      div.className = 'cart__item';
      div.innerHTML = `
        <div class="cart__item-info">
          <span class="cart__item-name">${item.name}</span>
          <span class="cart__item-type">${item.type === 'combo' ? 'Combo' : 'Plato'}</span>
        </div>
        <div class="cart__item-controls">
          <button class="cart__qty-btn" data-index="${index}" data-action="dec">-</button>
          <span class="cart__qty">${item.quantity}</span>
          <button class="cart__qty-btn" data-index="${index}" data-action="inc">+</button>
          <span class="cart__item-price">${(convertedPrice * item.quantity).toFixed(2)} ${displayCurrency}</span>
          <button class="cart__remove" data-index="${index}">&times;</button>
        </div>
      `;
      this.$items.appendChild(div);

      div.querySelectorAll('[data-action="inc"]').forEach(button => button.addEventListener('click', () => {
        cart.updateQuantity(index, items[index].quantity + 1);
      }));
      div.querySelectorAll('[data-action="dec"]').forEach(button => button.addEventListener('click', () => {
        cart.updateQuantity(index, items[index].quantity - 1);
      }));
      div.querySelector('.cart__remove').addEventListener('click', () => {
        cart.removeItem(index);
      });
    });

    const totalConverted = cart.getTotal() * rate;
    this.$total.textContent = `${totalConverted.toFixed(2)} ${displayCurrency}`;
  }
}

customElements.define('slice-cart-drawer', CartDrawer);
