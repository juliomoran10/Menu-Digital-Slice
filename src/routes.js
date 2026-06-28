const routes = [
   { path: '/',          component: 'AppShell', metadata: { title: 'Panel Administrativo' } },
   { path: '/menu/${id}', component: 'AppShell', metadata: { title: 'Menú Público' } },
   { path: '/finanzas',  component: 'AppShell', metadata: { title: 'Simulador Cambiario' } },
   { path: '/404',       component: 'NotFound', metadata: { title: 'Not Found' } }
];

export default routes;