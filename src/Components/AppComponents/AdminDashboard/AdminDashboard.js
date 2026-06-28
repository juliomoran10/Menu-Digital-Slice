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

  async openCreateModal() {
    const form = await this.createPlatoForm();
    slice.events.emit('modal:open', {
      title: 'Nuevo Plato',
      content: form,
    });
  }

  async openEditModal(plato) {
    const form = await this.createPlatoForm(plato);
    slice.events.emit('modal:open', {
      title: 'Editar Plato',
      content: form,
    });
  }

  async createPlatoForm(plato) {
    const form = document.createElement('form');
    form.className = 'admin__form';

    const nombreInput = await slice.build('Input', {
      label: 'Nombre',
      value: plato?.nombre || '',
      required: true,
    });

    const descContainer = document.createElement('label');
    descContainer.className = 'block mb-3';
    const descLabel = document.createElement('span');
    descLabel.className = 'text-sm font-medium';
    descLabel.textContent = 'Descripción';
    const textarea = document.createElement('textarea');
    textarea.id = 'field-descripcion';
    textarea.required = true;
    textarea.className = 'w-full px-3 py-2 rounded border mt-1';
    textarea.style.cssText = 'width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--input-border);background:var(--input-background);color:var(--font-primary-color);font-family:inherit;resize:vertical;min-height:80px;margin-top:4px';
    textarea.value = plato?.descripcion || '';
    descContainer.appendChild(descLabel);
    descContainer.appendChild(textarea);

    const catContainer = document.createElement('label');
    catContainer.className = 'block mb-3';
    const catLabel = document.createElement('span');
    catLabel.className = 'text-sm font-medium';
    catLabel.textContent = 'Categoría';
    const select = document.createElement('select');
    select.id = 'field-categoria';
    select.className = 'w-full px-3 py-2 rounded border mt-1';
    select.style.cssText = 'width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--input-border);background:var(--input-background);color:var(--font-primary-color);font-family:inherit;margin-top:4px';
    const state = slice.context.getState('restaurantContext');
    (state?.categorias || []).forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.nombre;
      if (plato && plato.categoriaId === cat.id) opt.selected = true;
      select.appendChild(opt);
    });
    catContainer.appendChild(catLabel);
    catContainer.appendChild(select);

    const precioInput = await slice.build('Input', {
      label: 'Precio Base ($)',
      type: 'number',
      value: plato?.precioBase?.toString() || '',
      required: true,
    });

    const imagenInput = await slice.build('Input', {
      label: 'URL de Imagen',
      type: 'url',
      value: plato?.imageUrl || '',
      placeholder: 'https://ejemplo.com/imagen.jpg',
    });

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'w-full py-2 rounded text-white font-medium';
    submitBtn.style.cssText = 'width:100%;padding:10px;border-radius:8px;border:none;background:var(--primary-color);color:var(--primary-color-contrast);font-size:1rem;cursor:pointer;margin-top:8px';
    submitBtn.textContent = plato ? 'Guardar Cambios' : 'Crear Plato';

    form.appendChild(nombreInput);
    form.appendChild(descContainer);
    form.appendChild(catContainer);
    form.appendChild(precioInput);
    form.appendChild(imagenInput);
    form.appendChild(submitBtn);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = {
        nombre: nombreInput.value,
        descripcion: textarea.value,
        categoriaId: select.value,
        precioBase: parseFloat(precioInput.value),
        imageUrl: imagenInput.value,
      };
      const store = this.getStore();
      if (plato) {
        store.updatePlato(plato.id, data);
      } else {
        store.addPlato(data);
      }
      slice.events.emit('modal:close');
    });

    return form;
  }

  async openCreateComboModal() {
    const form = await this.createComboForm();
    slice.events.emit('modal:open', {
      title: 'Nuevo Combo',
      content: form,
    });
  }

  async createComboForm() {
    const form = document.createElement('form');
    form.className = 'admin__form';

    const nombreInput = await slice.build('Input', {
      label: 'Nombre del Combo',
      value: '',
      placeholder: 'Ej: Combo Familiar',
      required: true,
    });

    const descContainer = document.createElement('label');
    descContainer.style.cssText = 'display:block;margin-bottom:12px';
    const descLabel = document.createElement('span');
    descLabel.className = 'text-sm font-medium';
    descLabel.textContent = 'Descripción';
    const textarea = document.createElement('textarea');
    textarea.id = 'combo-descripcion';
    textarea.placeholder = 'Describe el combo';
    textarea.style.cssText = 'width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--input-border);background:var(--input-background);color:var(--font-primary-color);font-family:inherit;resize:vertical;min-height:80px;margin-top:4px';
    descContainer.appendChild(descLabel);
    descContainer.appendChild(textarea);

    const precioInput = await slice.build('Input', {
      label: 'Precio Total ($)',
      type: 'number',
      value: '',
      placeholder: '0.00',
      required: true,
    });

    const platosLabel = document.createElement('span');
    platosLabel.className = 'text-sm font-medium';
    platosLabel.textContent = 'Platos incluidos';
    const platosContainer = document.createElement('div');
    platosContainer.id = 'combo-platos';

    const state = slice.context.getState('restaurantContext');
    const platos = state?.platos || [];
    platos.forEach(plato => {
      const label = document.createElement('label');
      label.style.cssText = 'display:flex;align-items:center;gap:8px;margin:4px 0;font-weight:normal';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'combo-plato-check';
      checkbox.value = plato.id;
      const nameSpan = document.createElement('span');
      nameSpan.textContent = `${plato.nombre} - $${plato.precioBase.toFixed(2)}`;
      label.appendChild(checkbox);
      label.appendChild(nameSpan);
      platosContainer.appendChild(label);
    });

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.style.cssText = 'width:100%;padding:10px;background:var(--primary-color);color:var(--primary-color-contrast);border:none;border-radius:var(--border-radius-slice);font-size:1rem;cursor:pointer';
    submitBtn.textContent = 'Crear Combo';

    form.appendChild(nombreInput);
    form.appendChild(descContainer);
    form.appendChild(precioInput);
    form.appendChild(platosLabel);
    form.appendChild(platosContainer);
    form.appendChild(submitBtn);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const nombre = nombreInput.value;
      const descripcion = textarea.value;
      const totalPrice = parseFloat(precioInput.value);
      const selectedPlatos = [...form.querySelectorAll('.combo-plato-check:checked')].map(cb => ({
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

    return form;
  }
}

customElements.define('slice-admin-dashboard', AdminDashboard);
