import Slice from '/Slice/Slice.js';

const THEME_CACHE_VERSION = 'v3';
const existing = localStorage.getItem('slice:themeVersion');
if (existing !== THEME_CACHE_VERSION) {
  ['sliceTheme-Light', 'sliceTheme-Dark', 'sliceTheme-Slice', 'sliceTheme', 'slice_theme'].forEach(key => localStorage.removeItem(key));
  localStorage.setItem('slice:themeVersion', THEME_CACHE_VERSION);

  const poll = setInterval(async () => {
    const tm = slice.stylesManager?.themeManager;
    if (tm?.currentTheme) {
      clearInterval(poll);
      const theme = tm.currentTheme;
      tm.themeStyles.clear();
      const url = `/Themes/${theme}.css?_=${Date.now()}`;
      const resp = await fetch(url);
      const css = await resp.text();
      tm.themeStyles.set(theme, css);
      tm.setThemeStyle(theme);
      tm.saveThemeLocally(theme, css);
    }
  }, 10);
}
