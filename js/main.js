/* Boot: menus, app-shell tweaks, first render. */
(function () {
  'use strict';
  if (BP.inApp) document.documentElement.classList.add('in-app');

  function item(m) {
    return '<li><a href="' + m.href + '" data-nav="' + m.nav + '"><span class="icon-tile">' + BP.icon(m.icon) + '</span>' + m.label +
      (m.count ? '<b class="menu-count" data-compare-count></b>' : '') + '</a></li>';
  }
  var toolRoutes = BP.TOOLS.map(function (t) { return t.route; });

  // 분석 도구 is one group: tap it to open the list of tools, grouped like the 분석 도구 page
  var toolsGroup =
    '<li class="menu-group">' +
      '<button type="button" class="menu-toggle" aria-expanded="false" aria-controls="menu-tools" data-nav="tools ' + toolRoutes.join(' ') + '">' +
        '<span class="icon-tile">' + BP.icon('tools') + '</span>분석 도구' + BP.icon('chevron', 'sm chev') +
      '</button>' +
      '<div class="sub-menu" id="menu-tools" hidden>' +
        '<a class="sub-all" href="#/tools" data-nav="tools">전체 도구 한눈에 보기</a>' +
        BP.TOOL_GROUPS.map(function (g) {
          return '<p class="sub-label">' + g.title + '</p>' + g.routes.map(BP.tool).map(function (t) {
            return '<a href="#/' + t.route + '" data-nav="' + t.route + '">' + BP.icon(t.icon, 'sm') + t.title + '</a>';
          }).join('');
        }).join('') +
      '</div>' +
    '</li>';

  document.getElementById('drawer-menu').innerHTML =
    item({ href: '#/', icon: 'map', label: '지도', nav: 'home' }) +
    item({ href: '#/apartments', icon: 'building', label: '모든 아파트 보기', nav: 'apartments apt' }) +
    item({ href: '#/saved', icon: 'heart', label: '관심 단지', nav: 'saved' }) +
    item({ href: '#/compare', icon: 'compare', label: '비교하기', nav: 'compare', count: true }) +
    toolsGroup +
    item({ href: '#/about', icon: 'info', label: '비교파트 소개', nav: 'about' });

  var toggle = document.querySelector('.menu-toggle');
  var sub = document.getElementById('menu-tools');
  function setOpen(open) { toggle.setAttribute('aria-expanded', open); sub.hidden = !open; }
  toggle.addEventListener('click', function () { setOpen(sub.hidden); });
  // open the group automatically whenever the drawer opens on a tool page
  var openDrawer = BP.openDrawer;
  BP.openDrawer = function () {
    if (toolRoutes.concat('tools').indexOf(BP.parseHash().name) >= 0) setOpen(true);
    openDrawer();
  };

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') BP.closeDrawer(); });

  // In the app: start on the apartment list, and use app tabs (아파트 · 지도 · 관심 · 비교 · 더보기)
  if (BP.inApp) {
    var tab = function (href, nav, icon, label, extra) {
      return '<a href="' + href + '" data-nav="' + nav + '">' + BP.icon(icon) + label + (extra || '') + '</a>';
    };
    var bar = document.querySelector('.tabbar');
    if (bar) bar.innerHTML =
      tab('#/apartments', 'apartments apt', 'building', '아파트') +
      tab('#/', 'home', 'map', '지도') +
      tab('#/saved', 'saved', 'heart', '관심') +
      tab('#/compare', 'compare', 'compare', '비교', '<span class="badge" data-compare-count></span>') +
      '<button type="button" onclick="BP.openDrawer()" data-nav="tools school value commute rebuild reviews safety about">' + BP.icon('menu') + '더보기</button>';
    if (!location.hash || location.hash === '#/' || location.hash === '#') history.replaceState(null, '', '#/apartments');
  }

  // Offline: everything except the map keeps working, because the data is part of the app
  var offline = document.createElement('div');
  offline.className = 'offline-bar';
  offline.setAttribute('role', 'status');
  offline.innerHTML = BP.icon('wifiOff', 'sm') + '<span>오프라인 상태예요. 지도는 인터넷이 필요하지만 단지 정보·비교·분석은 그대로 쓸 수 있어요.</span>';
  document.getElementById('view').before(offline);
  function onlineState() { document.documentElement.classList.toggle('is-offline', navigator.onLine === false); }
  window.addEventListener('online', onlineState);
  window.addEventListener('offline', onlineState);
  onlineState();

  BP.render();
})();
