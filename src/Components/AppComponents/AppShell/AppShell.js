export default class AppShell extends HTMLElement {
   constructor(props) {
      super();
      slice.attachTemplate(this);
      this.$content = this.querySelector('.app-shell__content');
      this.$themeSlot = this.querySelector('.app-shell__theme');
      slice.controller.setComponentProps(this, props);
   }

   async init() {
      await slice.build('ApiService', { sliceId: 'api-service' });
      await slice.build('CartService', { sliceId: 'cart-service' });
      await slice.build('RestaurantStore', { sliceId: 'restaurant-store' });
      const exchangeService = await slice.build('ExchangeService', { sliceId: 'exchange-service' });
      exchangeService.fetchRates('USD').then(rates => {
        const store = slice.controller.getComponent('restaurant-store');
        if (store) store.setExchangeRates(rates);
      });

      const sidebar = await slice.build('Sidebar', { sliceId: 'app-sidebar' });
      this.prepend(sidebar);

      const themeToggle = await slice.build('ThemeToggle', { sliceId: 'theme-toggle' });
      this.$themeSlot.appendChild(themeToggle);

      const modal = await slice.build('AppModal', { sliceId: 'app-modal' });
      this.appendChild(modal);

      const cart = await slice.build('CartDrawer', { sliceId: 'cart-drawer' });
      this.appendChild(cart);

      window.addEventListener('sidebar:toggle', (event) => {
        this.classList.toggle('app-shell--sidebar-collapsed', event.detail.collapsed);
      });
      if (localStorage.getItem('sidebar:collapsed') === 'true') {
        this.classList.add('app-shell--sidebar-collapsed');
      }

      slice.events.subscribe('currency:changed', (currency) => {
        slice.context.setState('restaurantContext', (prev) => ({ ...prev, selectedCurrency: currency }));
      });

      const multiRoute = await slice.build('MultiRoute', {
         sliceId: 'app-content',
         routes: [
            { path: '/', component: 'AdminDashboard' },
            { path: '/menu/${id}', component: 'PublicMenu' },
            { path: '/finanzas', component: 'FinancialSimulator' }
         ]
      });
      this.$content.appendChild(multiRoute);
   }

   update() {}
}

customElements.define('slice-app-shell', AppShell);
