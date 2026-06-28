export default class FinancialSimulator extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    this.$tabla = this.querySelector('.financiero__tabla tbody');
    this.$orders = this.querySelector('.financiero__orders');
    this.$chart = this.querySelector('.financiero__chart');
    this.$totalVentas = this.querySelector('.financiero__total-ventas');
    this.$totalPedidos = this.querySelector('.financiero__total-pedidos');
    slice.controller.setComponentProps(this, props);
  }

  async init() {
    await this.loadRates();
    this.renderRates();
    this.renderOrders();
    this.renderChart();
    this.renderMetrics();

    slice.events.subscribe('rates:updated', () => this.renderRates());
    slice.events.subscribe('orders:updated', () => { this.renderOrders(); this.renderChart(); this.renderMetrics(); });
    slice.events.subscribe('order:created', () => { this.renderOrders(); this.renderChart(); this.renderMetrics(); });
  }

  update() {
    this.renderRates();
    this.renderOrders();
    this.renderChart();
    this.renderMetrics();
  }

  async loadRates() {
    try {
      const exchangeService = slice.controller.getComponent('exchange-service');
      let rates;
      if (exchangeService) {
        rates = await exchangeService.fetchRates('USD');
      } else {
        const response = await fetch('/api/menu/rates?from=USD');
        const data = await response.json();
        rates = data.base;
      }
      const store = slice.controller.getComponent('restaurant-store');
      if (store) store.setExchangeRates(rates);
    } catch {}
  }

  renderRates() {
    const state = slice.context.getState('restaurantContext');
    const rates = state?.exchangeRates || {};
    const currencies = ['EUR', 'MXN', 'BRL', 'COP', 'VES', 'ARS'];

    this.$tabla.innerHTML = '';
    currencies.forEach(currency => {
      const rate = rates[currency];
      if (!rate) return;
      const row = document.createElement('tr');
      row.innerHTML = `<td>${currency}</td><td>${rate.toFixed(4)}</td>`;
      this.$tabla.appendChild(row);
    });
  }

  renderChart() {
    const state = slice.context.getState('restaurantContext');
    const orders = state?.orders || [];

    const counts = {};
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        const name = item.name || item.nombre || 'Producto';
        counts[name] = (counts[name] || 0) + (item.quantity || 1);
      });
    });

    const sorted = Object.entries(counts).sort((entryA, entryB) => entryB[1] - entryA[1]).slice(0, 10);
    const maxCount = sorted.length > 0 ? sorted[0][1] : 1;

    this.$chart.innerHTML = '';
    if (sorted.length === 0) {
      this.$chart.innerHTML = '<div class="financiero__empty">Sin datos aún</div>';
      return;
    }
    sorted.forEach(([name, count]) => {
      const pct = (count / maxCount) * 100;
      const bar = document.createElement('div');
      bar.className = 'financiero__chart-bar';
      bar.innerHTML = `
        <span class="financiero__chart-label">${name}</span>
        <div class="financiero__chart-track"><div class="financiero__chart-fill" style="width:${pct}%"></div></div>
        <span class="financiero__chart-count">${count}</span>
      `;
      this.$chart.appendChild(bar);
    });
  }

  renderOrders() {
    const state = slice.context.getState('restaurantContext');
    const orders = state?.orders || [];

    this.$orders.innerHTML = '';
    if (orders.length === 0) {
      this.$orders.innerHTML = '<div class="financiero__empty">No hay compras registradas aún</div>';
      return;
    }

    orders.slice(0, 20).forEach(order => {
      const card = document.createElement('div');
      card.className = 'financiero__order-card';

      const date = order.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString();
      const items = (order.items || []).map(item => `${item.name} x${item.quantity}`).join(', ');

      card.innerHTML = `
        <div class="financiero__order-header">
          <span>${date}</span>
          <span>#${order.id || '-'}</span>
        </div>
        <div class="financiero__order-items">${items || 'Sin items'}</div>
        <div class="financiero__order-total">Total: $${(order.total || 0).toFixed(2)} ${order.currency || 'USD'}</div>
      `;
      this.$orders.appendChild(card);
    });
  }

  renderMetrics() {
    const state = slice.context.getState('restaurantContext');
    const orders = state?.orders || [];
    const total = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
    this.$totalVentas.textContent = `$${total.toFixed(2)}`;
    this.$totalPedidos.textContent = orders.length;
  }
}

customElements.define('slice-financial-simulator', FinancialSimulator);
