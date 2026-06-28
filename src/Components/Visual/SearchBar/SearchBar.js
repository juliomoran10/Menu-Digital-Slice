export default class SearchBar extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    this.$input = this.querySelector('.search-bar__input');
    slice.controller.setComponentProps(this, props);
  }

  init() {
    this.$input.addEventListener('input', (event) => {
      slice.events.emit('search:changed', event.target.value);
    });
  }
}

customElements.define('slice-search-bar', SearchBar);
