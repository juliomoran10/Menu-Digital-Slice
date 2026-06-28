export default class RestaurantStore {
  constructor() {
    this.restaurante = null;
    this.categorias = [];
    this.platos = [];
    this.combos = [];
    this.selectedCurrency = 'USD';
    this.exchangeRates = {};
    this.orders = [];
    this.api = null;
  }

  async init() {
    this.api = slice.controller.getComponent('api-service');

    try {
      if (this.api) {
        const rest = await this.api.getRestaurant();
        if (rest) {
          this.restaurante = { id: String(rest.id), nombre: rest.name, logoUrl: rest.logo_url || '', monedaBase: rest.base_currency || 'USD' };
          this.selectedCurrency = this.restaurante.monedaBase;
        }
        const cats = await this.api.getCategories();
        this.categorias = cats.map(cat => ({ id: String(cat.id), restauranteId: String(cat.restaurant_id), nombre: cat.name, orden: cat.sort_order }));

        const dishes = await this.api.getDishes();
        this.platos = dishes.map(dish => ({ id: String(dish.id), categoriaId: String(dish.category_id), nombre: dish.name, descripcion: dish.description || '', precioBase: parseFloat(dish.base_price), disponible: dish.available, imageUrl: dish.image_url || '' }));

        const combos = await this.api.getCombos();
        this.combos = combos.map(combo => ({ id: String(combo.id), nombre: combo.name, descripcion: combo.description || '', totalPrice: parseFloat(combo.total_price), items: (combo.items || []).map(item => ({ dishId: String(item.dish_id), dishName: item.dish_name || '', quantity: item.quantity })) }));
      }
    } catch {
      this.loadLocalFallback();
    }

    this.loadLocalOrders();
    await this.loadApiOrders();

    slice.context.create('restaurantContext', {
      restaurante: this.restaurante,
      categorias: this.categorias,
      platos: this.platos,
      combos: this.combos,
      selectedCurrency: this.selectedCurrency,
      exchangeRates: this.exchangeRates,
      orders: this.orders,
    });
  }

  loadLocalFallback() {
    const saved = localStorage.getItem('menu-digital-data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.restaurante = data.restaurante || this.getDefaultRestaurante();
        this.categorias = data.categorias || [];
        this.platos = data.platos || [];
      } catch {
        this.restaurante = this.getDefaultRestaurante();
      }
    } else {
      this.restaurante = this.getDefaultRestaurante();
      this.categorias = this.getDefaultCategorias();
      this.platos = this.getDefaultPlatos();
    }
  }

  getDefaultRestaurante() {
    return { id: 'local-1', nombre: 'Mi Restaurante', logoUrl: '', monedaBase: 'USD' };
  }

  getDefaultCategorias() {
    return [
      { id: 'cat-1', restauranteId: 'local-1', nombre: 'Entradas', orden: 1 },
      { id: 'cat-2', restauranteId: 'local-1', nombre: 'Platos Fuertes', orden: 2 },
      { id: 'cat-3', restauranteId: 'local-1', nombre: 'Bebidas', orden: 3 },
      { id: 'cat-4', restauranteId: 'local-1', nombre: 'Postres', orden: 4 },
    ];
  }

  getDefaultPlatos() {
    return [
      { id: 'dish-1', categoriaId: 'cat-1', nombre: 'Teque\u00F1os', descripcion: 'Palitos de queso frito', precioBase: 5.00, disponible: true },
      { id: 'dish-2', categoriaId: 'cat-1', nombre: 'Ceviche', descripcion: 'Pescado marinado con lim\u00F3n', precioBase: 8.50, disponible: true },
      { id: 'dish-3', categoriaId: 'cat-2', nombre: 'Parrilla Mixta', descripcion: 'Carne, pollo y chorizo', precioBase: 18.00, disponible: true },
      { id: 'dish-4', categoriaId: 'cat-2', nombre: 'Hamburguesa Cl\u00E1sica', descripcion: 'Carne 200g con queso', precioBase: 12.00, disponible: true },
      { id: 'dish-5', categoriaId: 'cat-3', nombre: 'Limonada Natural', descripcion: 'Limonada con hierbabuena', precioBase: 3.50, disponible: true },
      { id: 'dish-6', categoriaId: 'cat-3', nombre: 'Coca Cola 500ml', descripcion: 'Refresco personal', precioBase: 2.50, disponible: true },
      { id: 'dish-7', categoriaId: 'cat-4', nombre: 'Tres Leches', descripcion: 'Pastel ba\u00F1ado en tres leches', precioBase: 6.00, disponible: true },
    ];
  }

  persist() {
    localStorage.setItem('menu-digital-data', JSON.stringify({
      restaurante: this.restaurante, categorias: this.categorias, platos: this.platos, selectedCurrency: this.selectedCurrency,
    }));
  }

  async syncToApi() {
    if (!this.api) return;
    try {
      if (this.restaurante) {
        await this.api.updateRestaurant({ name: this.restaurante.nombre, base_currency: this.restaurante.monedaBase });
      }
    } catch {}
  }

  updateRestaurante(data) {
    this.restaurante = { ...this.restaurante, ...data };
    slice.context.setState('restaurantContext', (prev) => ({ ...prev, restaurante: this.restaurante }));
    this.persist();
    this.syncToApi();
    slice.events.emit('restaurante:updated', this.restaurante);
  }

  getCategorias() {
    return slice.context.getState('restaurantContext')?.categorias || this.categorias;
  }

  async addCategoria(nombre) {
    if (this.api) {
      const cat = await this.api.createCategory(nombre);
      const nueva = { id: String(cat.id), restauranteId: String(cat.restaurant_id), nombre: cat.name, orden: cat.sort_order };
      this.categorias.push(nueva);
    } else {
      const nueva = { id: crypto.randomUUID(), restauranteId: this.restaurante.id, nombre, orden: this.categorias.length + 1 };
      this.categorias.push(nueva);
    }
    slice.context.setState('restaurantContext', (prev) => ({ ...prev, categorias: this.categorias }));
    this.persist();
    slice.events.emit('categoria:created', this.categorias[this.categorias.length - 1]);
  }

  async deleteCategoria(id) {
    if (this.api) await this.api.deleteCategory(parseInt(id));
    this.categorias = this.categorias.filter(cat => cat.id !== id);
    this.platos = this.platos.filter(plato => plato.categoriaId !== id);
    slice.context.setState('restaurantContext', (prev) => ({ ...prev, categorias: this.categorias, platos: this.platos }));
    this.persist();
    slice.events.emit('categoria:deleted', id);
  }

  getPlatos(categoriaId) {
    const platos = slice.context.getState('restaurantContext')?.platos || this.platos;
    return categoriaId ? platos.filter(plato => plato.categoriaId === categoriaId) : platos;
  }

  getCombos() {
    return slice.context.getState('restaurantContext')?.combos || this.combos;
  }

  async addPlato(data) {
    let nuevo;
    if (this.api) {
      const dish = await this.api.createDish({ category_id: parseInt(data.categoriaId), name: data.nombre, description: data.descripcion, base_price: data.precioBase });
      nuevo = { id: String(dish.id), categoriaId: String(dish.category_id), nombre: dish.name, descripcion: dish.description || '', precioBase: parseFloat(dish.base_price), disponible: true };
    } else {
      nuevo = { id: crypto.randomUUID(), ...data, disponible: true, imageUrl: data.imageUrl || '' };
    }
    this.platos.push(nuevo);
    slice.context.setState('restaurantContext', (prev) => ({ ...prev, platos: this.platos }));
    this.persist();
    slice.events.emit('plato:created', nuevo);
    return nuevo;
  }

  async updatePlato(id, data) {
    if (this.api) {
      await this.api.updateDish(parseInt(id), { name: data.nombre, description: data.descripcion, base_price: data.precioBase, category_id: parseInt(data.categoriaId), image_url: data.imageUrl });
    }
    this.platos = this.platos.map(plato => plato.id === id ? { ...plato, ...data } : plato);
    slice.context.setState('restaurantContext', (prev) => ({ ...prev, platos: this.platos }));
    this.persist();
    slice.events.emit('plato:updated', { id, ...data });
  }

  async deletePlato(id) {
    if (this.api) await this.api.deleteDish(parseInt(id));
    this.platos = this.platos.filter(plato => plato.id !== id);
    slice.context.setState('restaurantContext', (prev) => ({ ...prev, platos: this.platos }));
    this.persist();
    slice.events.emit('plato:deleted', id);
  }

  async toggleDisponibilidad(id) {
    if (this.api) {
      await this.api.toggleDish(parseInt(id));
    }
    const plato = this.platos.find(plato => plato.id === id);
    if (plato) {
      plato.disponible = !plato.disponible;
      slice.context.setState('restaurantContext', (prev) => ({ ...prev, platos: this.platos }));
      this.persist();
      slice.events.emit('plato:updated', plato);
    }
  }

  async addCombo(data) {
    if (this.api) {
      const combo = await this.api.createCombo({ name: data.name, description: data.description, total_price: data.total_price, items: data.items });
      const nuevo = {
        id: String(combo.id), nombre: combo.name, descripcion: combo.description || '', totalPrice: parseFloat(combo.total_price),
        items: (combo.items || []).map(item => ({ dishId: String(item.dish_id), dishName: item.dish_name || '', quantity: item.quantity }))
      };
      this.combos.push(nuevo);
    } else {
      const nuevo = { id: 'local-' + Date.now(), nombre: data.name, descripcion: data.description || '', totalPrice: data.total_price, items: data.items || [] };
      this.combos.push(nuevo);
    }
    slice.context.setState('restaurantContext', (prev) => ({ ...prev, combos: this.combos }));
    slice.events.emit('combos:updated', this.combos);
  }

  async deleteCombo(id) {
    if (this.api) await this.api.deleteCombo(parseInt(id));
    this.combos = this.combos.filter(combo => combo.id !== id);
    slice.context.setState('restaurantContext', (prev) => ({ ...prev, combos: this.combos }));
    slice.events.emit('combos:updated', this.combos);
  }

  loadLocalOrders() {
    try {
      this.orders = JSON.parse(localStorage.getItem('menu-orders') || '[]');
    } catch {
      this.orders = [];
    }
  }

  async loadApiOrders() {
    if (!this.api) return;
    try {
      const apiOrders = await this.api.getOrders();
      if (apiOrders && apiOrders.length > 0) {
        this.orders = apiOrders.map(order => ({
          id: order.id, items: order.items, total: parseFloat(order.total), currency: order.currency, status: order.status, createdAt: order.created_at
        }));
      }
    } catch {}
  }

  addOrder(order) {
    this.orders.unshift(order);
    slice.context.setState('restaurantContext', (prev) => ({ ...prev, orders: this.orders }));
    slice.events.emit('orders:updated', this.orders);
  }

  setExchangeRates(rates) {
    this.exchangeRates = rates;
    slice.context.setState('restaurantContext', (prev) => ({ ...prev, exchangeRates: rates }));
    slice.events.emit('rates:updated', rates);
  }
}
