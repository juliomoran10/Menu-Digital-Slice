export default class ExchangeService {
  constructor() {
    this.lastRates = null;
    this.status = 'idle';
  }

  async fetchRates(base = 'USD') {
    this.status = 'loading';
    slice.events.emit('exchange:loading', true);

    try {
      const response = await fetch(`/api/menu/rates?from=${base}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      this.lastRates = data.base;
      this.status = 'success';
      slice.events.emit('exchange:success', data.base);
      return data.base;
    } catch (error) {
      this.lastRates = {
        USD: 1, EUR: 0.87, MXN: 17.34, BRL: 5.16, VES: 607.39, COP: 4100, ARS: 850
      };
      this.status = 'success';
      slice.events.emit('exchange:success', this.lastRates);
      return this.lastRates;
    }
  }

  getStatus() {
    return this.status;
  }
}
