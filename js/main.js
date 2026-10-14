/* Boot: menus, app-shell tweaks, first render. */
(function () {
  'use strict';
  if (BP.inApp) document.documentElement.classList.add('in-app');

  var menu = [
    { href: '#/', icon: 'map', label: '지도', nav: 'home' },
    { href: '#/apartments', icon: 'building', label: '모든 아파트 보기', nav: 'apartments apt' },
    { href: '#/compare', icon: 'compare', label: '비교하기', nav: 'compare', count: true }
  ].concat(BP.TOOLS.map(function (t) { return { href: '#/' + t.route, icon: t.icon, label: t.title, nav: t.route }; }))
   .concat([{ href: '#/about', icon: 'info', label: '비교파트 소개', nav: 'about' }]);

  document.getElementById('drawer-menu').innerHTML = menu.map(function (m) {
    return '<li><a href="' + m.href + '" data-nav="' + m.nav + '"><span class="icon-tile">' + BP.icon(m.icon) + '</span>' + m.label + (m.count ? '<b class="menu-count" data-compare-count></b>' : '') + '</a></li>';
  }).join('');

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') BP.closeDrawer(); });

  BP.render();
})();
