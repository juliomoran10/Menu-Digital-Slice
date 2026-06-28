export default class CartService {
  constructor() {
    this.items = [];
    this.load();
  }

  load() {
    try {
      this.items = JSON.parse(localStorage.getItem('menu-cart') || '[]');
    } catch {
      this.items = [];
    }
  }

  save() {
    localStorage.setItem('menu-cart', JSON.stringify(this.items));
    slice.events.emit('cart:updated', this.items);
  }

  addDish(dish, quantity = 1) {
    const existing = this.items.find(item => item.type === 'dish' && item.id === dish.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({ type: 'dish', id: dish.id, name: dish.name, price: dish.base_price, quantity });
    }
    this.save();
  }

  addCombo(combo, quantity = 1) {
    const existing = this.items.find(item => item.type === 'combo' && item.id === combo.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({ type: 'combo', id: combo.id, name: combo.nombre || combo.name, price: parseFloat(combo.totalPrice || combo.total_price || 0), quantity });
    }
    this.save();
  }

  removeItem(index) {
    this.items.splice(index, 1);
    this.save();
  }

  updateQuantity(index, qty) {
    if (qty <= 0) return this.removeItem(index);
    this.items[index].quantity = qty;
    this.save();
  }

  getTotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  getCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  clear() {
    this.items = [];
    this.save();
  }

  async checkout() {
    if (this.items.length === 0) return null;

    const api = slice.controller.getComponent('api-service');
    const order = {
      items: this.items,
      total: this.getTotal(),
      currency: 'USD',
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    if (api) {
      try {
        const saved = await api.createOrder(order);
        order.id = saved.id;
      } catch {}
    } else {
      order.id = 'local-' + Date.now();
    }

    const savedOrders = JSON.parse(localStorage.getItem('menu-orders') || '[]');
    savedOrders.unshift(order);
    localStorage.setItem('menu-orders', JSON.stringify(savedOrders));

    const store = slice.controller.getComponent('restaurant-store');
    if (store) store.addOrder(order);

    this.items = [];
    this.save();
    slice.events.emit('order:created', order);
    return order;
  }
}
