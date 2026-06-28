export default class AppModal extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    this.$overlay = this.querySelector('.modal-overlay');
    this.$content = this.querySelector('.modal-content');
    this.$body = this.querySelector('.modal-body');
    this.$title = this.querySelector('.modal-title');
    this.$closeBtn = this.querySelector('.modal-close');
    slice.controller.setComponentProps(this, props);
  }

  init() {
    this.$overlay.addEventListener('click', (event) => {
      if (event.target === this.$overlay) this.close();
    });
    this.$closeBtn.addEventListener('click', () => this.close());

    slice.events.subscribe('modal:open', (data) => this.open(data));
    slice.events.subscribe('modal:close', () => this.close());
  }

  open(data) {
    this.$body.innerHTML = '';
    this.$title.textContent = data.title || '';
    if (data.content) {
      this.$body.appendChild(data.content);
    }
    this.classList.add('modal--open');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.classList.remove('modal--open');
    document.body.style.overflow = '';
    this.$body.innerHTML = '';
  }
}

customElements.define('slice-app-modal', AppModal);
