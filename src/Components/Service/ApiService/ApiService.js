export default class ApiService {
  async request(method, path, body) {
    const res = await fetch(`/api/menu${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }

  getRestaurant() { return this.request('GET', '/restaurant'); }
  updateRestaurant(data) { return this.request('PUT', '/restaurant', data); }

  getCategories() { return this.request('GET', '/categories'); }
  createCategory(name) { return this.request('POST', '/categories', { name }); }
  deleteCategory(id) { return this.request('DELETE', `/categories/${id}`); }

  getDishes(categoryId) {
    const query = categoryId ? `?category_id=${categoryId}` : '';
    return this.request('GET', `/dishes${query}`);
  }
  createDish(data) { return this.request('POST', '/dishes', data); }
  updateDish(id, data) { return this.request('PUT', `/dishes/${id}`, data); }
  deleteDish(id) { return this.request('DELETE', `/dishes/${id}`); }
  toggleDish(id) { return this.request('PUT', `/dishes/${id}/toggle`); }

  getCombos() { return this.request('GET', '/combos'); }
  createCombo(data) { return this.request('POST', '/combos', data); }
  deleteCombo(id) { return this.request('DELETE', `/combos/${id}`); }

  getOrders() { return this.request('GET', '/orders'); }
  createOrder(data) { return this.request('POST', '/orders', data); }
}
