export default class Input extends HTMLElement {
  static props = {
    label:    { type: 'string',  default: '' },
    type:     { type: 'string',  default: 'text' },
    value:    { type: 'string',  default: '' },
    placeholder: { type: 'string', default: '' },
    name:     { type: 'string',  default: '' },
    required: { type: 'boolean', default: false },
    disabled: { type: 'boolean', default: false },
    error:    { type: 'string',  default: '' },
  };

  constructor(props) {
    super();
    slice.attachTemplate(this);
    this.$label = this.querySelector('.input__label');
    this.$field = this.querySelector('.input__field');
    this.$error = this.querySelector('.input__error');
    slice.controller.setComponentProps(this, props);
  }

  init() {
    this.$field.addEventListener('input', () => {
      const event = new CustomEvent('input:change', {
        detail: { value: this.$field.value },
        bubbles: true,
      });
      this.dispatchEvent(event);
    });
  }

  set label(value) {
    this._label = value || '';
    this.$label.textContent = this._label;
    this.$label.style.display = this._label ? '' : 'none';
  }

  set type(value) {
    this._type = value || 'text';
    this.$field.type = this._type;
  }

  set value(value) {
    this._value = value ?? '';
    this.$field.value = this._value;
  }

  get value() {
    return this.$field.value;
  }

  set placeholder(value) {
    this._placeholder = value || '';
    this.$field.placeholder = this._placeholder;
  }

  set name(value) {
    this._name = value || '';
    this.$field.name = this._name;
  }

  set required(value) {
    this._required = !!value;
    this.$field.required = this._required;
  }

  set disabled(value) {
    this._disabled = !!value;
    this.$field.disabled = this._disabled;
  }

  set error(value) {
    this._error = value || '';
    this.$error.textContent = this._error;
    this.$error.style.display = this._error ? '' : 'none';
    this.$field.classList.toggle('input__field--error', !!this._error);
  }
}

customElements.define('slice-input', Input);
