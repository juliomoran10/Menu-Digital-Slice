export default class AdminDashboard extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    this.$platosGrid = this.querySelector('.admin__platos-grid');
    this.$combosGrid = this.querySelector('.admin__combos-grid');
    this.$restauranteName = this.querySelector('.admin__restaurante-name');
    this.$btnAddPlato = this.querySelector('.admin__btn-add');
    this.$btnAddCombo = this.querySelector('.admin__btn-add-combo');
    this.$statsTotal = this.querySelector('.admin__stats-total');
    this.$statsDisponibles = this.querySelector('.admin__stats-disponibles');
    this.$statsCategorias = this.querySelector('.admin__stats-categorias');
    slice.controller.setComponentProps(this, props);
  }

  async init() {
    this.renderRestaurante();
    this.renderPlatos();
    this.renderCombos();
    this.renderStats();

    this.$btnAddPlato.addEventListener('click', () => this.openCreateModal());
    this.$btnAddCombo.addEventListener('click', () => this.openCreateComboModal());

    slice.events.subscribe('plato:created', () => { this.renderPlatos(); this.renderStats(); });
    slice.events.subscribe('plato:updated', () => { this.renderPlatos(); this.renderStats(); });
    slice.events.subscribe('plato:deleted', () => { this.renderPlatos(); this.renderStats(); });
    slice.events.subscribe('combos:updated', () => { this.renderCombos(); this.renderStats(); });
    slice.events.subscribe('restaurante:updated', () => this.renderRestaurante());
  }

  update() {
    this.renderRestaurante();
    this.renderPlatos();
    this.renderCombos();
    this.renderStats();
  }

  getStore() {
    return slice.controller.getComponent('restaurant-store');
  }

  renderRestaurante() {
    const state = slice.context.getState('restaurantContext');
    if (state?.restaurante) {
      this.$restauranteName.textContent = state.restaurante.nombre;
    }
  }

  renderStats() {
    const state = slice.context.getState('restaurantContext');
    const platos = state?.platos || [];
    const categorias = state?.categorias || [];
    this.$statsTotal.textContent = platos.length;
    this.$statsDisponibles.textContent = platos.filter(plato => plato.disponible).length;
    this.$statsCategorias.textContent = categorias.length;
  }

  renderPlatos() {
    this.$platosGrid.innerHTML = '';
    const state = slice.context.getState('restaurantContext');
    const platos = state?.platos || [];
    platos.forEach(plato => this.renderPlatoCard(plato));
  }

  renderCombos() {
    this.$combosGrid.innerHTML = '';
    const state = slice.context.getState('restaurantContext');
    const combos = state?.combos || [];
    combos.forEach(combo => this.renderComboCard(combo));
  }

  async renderPlatoCard(plato) {
    const card = await slice.build('PlatoCard', { plato });
    const actionsDiv = card.querySelector('.plato-card__actions');

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'admin__btn-toggle';
    toggleBtn.textContent = plato.disponible ? 'Desactivar' : 'Activar';
    toggleBtn.addEventListener('click', () => {
      const store = this.getStore();
      if (store) store.toggleDisponibilidad(plato.id);
    });
    actionsDiv.appendChild(toggleBtn);

    const editBtn = document.createElement('button');
    editBtn.className = 'admin__btn-edit';
    editBtn.textContent = 'Editar';
    editBtn.addEventListener('click', () => this.openEditModal(plato));
    actionsDiv.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'admin__btn-delete';
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.addEventListener('click', () => {
      const store = this.getStore();
      if (store) store.deletePlato(plato.id);
    });
    actionsDiv.appendChild(deleteBtn);

    this.$platosGrid.appendChild(card);
  }

  async renderComboCard(combo) {
    const card = await slice.build('ComboCard', { combo });

    const addBtn = card.querySelector('.combo-card__btn');
    if (addBtn) addBtn.style.display = 'none';

    const actionsDiv = card.querySelector('.combo-card__actions');
    if (actionsDiv) {
      actionsDiv.style.display = 'flex';
      actionsDiv.style.gap = '8px';
      actionsDiv.style.marginTop = '8px';

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'admin__btn-delete';
      deleteBtn.textContent = 'Eliminar';
      deleteBtn.addEventListener('click', () => {
        const store = this.getStore();
        if (store) store.deleteCombo(combo.id);
      });
      actionsDiv.appendChild(deleteBtn);
    }

    this.$combosGrid.appendChild(card);
  }

  openCreateModal() {
    const form = this.createPlatoForm();
    slice.events.emit('modal:open', {
      title: 'Nuevo Plato',
      content: form,
    });
  }

  openEditModal(plato) {
    const form = this.createPlatoForm(plato);
    slice.events.emit('modal:open', {
      title: 'Editar Plato',
      content: form,
    });
  }

  createPlatoForm(plato) {
    const container = document.createElement('div');
    container.innerHTML = `
      <form class="admin__form">
        <label class="block mb-3">
          <span class="text-sm font-medium">Nombre</span>
          <input type="text" id="field-nombre" value="${plato?.nombre || ''}" required class="w-full px-3 py-2 rounded border mt-1" />
        </label>
        <label class="block mb-3">
          <span class="text-sm font-medium">Descripción</span>
          <textarea id="field-descripcion" required class="w-full px-3 py-2 rounded border mt-1">${plato?.descripcion || ''}</textarea>
        </label>
        <label class="block mb-3">
          <span class="text-sm font-medium">Categoría</span>
          <select id="field-categoria" class="w-full px-3 py-2 rounded border mt-1"></select>
        </label>
        <label class="block mb-3">
          <span class="text-sm font-medium">Precio Base ($)</span>
          <input type="number" id="field-precio" step="0.01" value="${plato?.precioBase || ''}" required class="w-full px-3 py-2 rounded border mt-1" />
        </label>
        <label class="block mb-3">
          <span class="text-sm font-medium">URL de Imagen</span>
          <input type="url" id="field-imagen" value="${plato?.imageUrl || ''}" placeholder="https://ejemplo.com/imagen.jpg" class="w-full px-3 py-2 rounded border mt-1" />
        </label>
        <button type="submit" class="w-full py-2 rounded text-white font-medium" style="background:var(--primary-color)">
          ${plato ? 'Guardar Cambios' : 'Crear Plato'}
        </button>
      </form>
    `;
    const state = slice.context.getState('restaurantContext');
    const select = container.querySelector('#field-categoria');
    (state?.categorias || []).forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.nombre;
      if (plato && plato.categoriaId === cat.id) opt.selected = true;
      select.appendChild(opt);
    });

    container.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault();
      const data = {
        nombre: container.querySelector('#field-nombre').value,
        descripcion: container.querySelector('#field-descripcion').value,
        categoriaId: container.querySelector('#field-categoria').value,
        precioBase: parseFloat(container.querySelector('#field-precio').value),
        imageUrl: container.querySelector('#field-imagen').value,
      };
      const store = this.getStore();
      if (plato) {
        store.updatePlato(plato.id, data);
      } else {
        store.addPlato(data);
      }
      slice.events.emit('modal:close');
    });

    return container;
  }

  openCreateComboModal() {
    const form = this.createComboForm();
    slice.events.emit('modal:open', {
      title: 'Nuevo Combo',
      content: form,
    });
  }

  createComboForm() {
    const container = document.createElement('div');
    container.innerHTML = `
      <form class="admin__form">
        <label>
          <span>Nombre del Combo</span>
          <input type="text" id="combo-nombre" required placeholder="Ej: Combo Familiar" />
        </label>
        <label>
          <span>Descripción</span>
          <textarea id="combo-descripcion" placeholder="Describe el combo"></textarea>
        </label>
        <label>
          <span>Precio Total ($)</span>
          <input type="number" id="combo-precio" step="0.01" required placeholder="0.00" />
        </label>
        <label>
          <span>Platos incluidos</span>
          <div id="combo-platos"></div>
        </label>
        <button type="submit" style="width:100%;padding:10px;background:var(--primary-color);color:var(--primary-color-contrast);border:none;border-radius:var(--border-radius-slice);font-size:1rem;cursor:pointer">
          Crear Combo
        </button>
      </form>
    `;

    const state = slice.context.getState('restaurantContext');
    const platos = state?.platos || [];
    const platosContainer = container.querySelector('#combo-platos');
    platos.forEach(plato => {
      const label = document.createElement('label');
      label.style.cssText = 'display:flex;align-items:center;gap:8px;margin:4px 0;font-weight:normal';
      label.innerHTML = `
        <input type="checkbox" class="combo-plato-check" value="${plato.id}" />
        <span>${plato.nombre} - $${plato.precioBase.toFixed(2)}</span>
      `;
      platosContainer.appendChild(label);
    });

    container.querySelector('form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const nombre = container.querySelector('#combo-nombre').value;
      const descripcion = container.querySelector('#combo-descripcion').value;
      const totalPrice = parseFloat(container.querySelector('#combo-precio').value);
      const selectedPlatos = [...container.querySelectorAll('.combo-plato-check:checked')].map(cb => ({
        dish_id: parseInt(cb.value),
        quantity: 1
      }));

      if (selectedPlatos.length === 0) return;

      const store = this.getStore();
      if (store) {
        await store.addCombo({ name: nombre, description: descripcion, total_price: totalPrice, items: selectedPlatos });
      }
      slice.events.emit('modal:close');
    });

    return container;
  }
}

customElements.define('slice-admin-dashboard', AdminDashboard);
