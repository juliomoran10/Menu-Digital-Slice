export default class ThemeToggle extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    this.$switch = this.querySelector('.theme-toggle__switch');
    this.$thumb = this.querySelector('.theme-toggle__thumb');
    this.$toggle = this.querySelector('.theme-toggle');
    this.currentTheme = 'Light';
    slice.controller.setComponentProps(this, props);
  }

  async init() {
    const saved = localStorage.getItem('sliceTheme');
    if (saved) {
      this.currentTheme = saved;
      if (saved === 'Dark') this.$toggle.classList.add('theme-toggle--dark');
    }
    this.setIcon(this.currentTheme);

    this.$switch.addEventListener('click', async () => {
      const next = this.currentTheme === 'Light' ? 'Dark' : 'Light';
      await slice.setTheme(next);
      this.currentTheme = next;
      this.$toggle.classList.toggle('theme-toggle--dark', next === 'Dark');
      this.setIcon(next);
    });
  }

  setIcon(theme) {
    const isDark = theme === 'Dark';
    this.$thumb.innerHTML = isDark
      ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }
}

customElements.define('slice-theme-toggle', ThemeToggle);
