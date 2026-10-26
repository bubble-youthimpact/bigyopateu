/* 홈: 네이버 지도 + 메뉴 + 커뮤니티 시설 필터 */
(function () {
  'use strict';
  var state = { amenities: [], area: '' };

  function mapSrc() {
    var base = (BP.inApp && BP.config.siteUrl) ? BP.config.siteUrl.replace(/\/?$/, '/') : '';
    var inset = window.innerWidth > 760 ? 0 : 0;
    var v = (window.BIGYO_DATA && window.BIGYO_DATA.generatedAt) || '';
    return base + 'map.html?inset=' + inset + '&v=' + encodeURIComponent(v);
  }

  function sendFilter(fit) {
    var frame = document.getElementById('map-frame');
    if (!frame || !frame.contentWindow) return;
    frame.contentWindow.postMessage({ source: 'bigyo-app', type: 'filter', amenities: state.amenities, area: state.area, fit: !!fit }, '*');
  }

  function sendCompare() {
    var frame = document.getElementById('map-frame');
    if (frame && frame.contentWindow) frame.contentWindow.postMessage({ source: 'bigyo-app', type: 'compare-state', ids: BP.compare.list() }, '*');
  }

  function count() {
    return BP.apartments.filter(function (a) {
      return (!state.area || a.dong === state.area) && BP.hasAll(a, state.amenities);
    }).length;
  }

  window.addEventListener('message', function (e) {
    var msg = e.data || {};
    if (msg.source !== 'bigyo-map') return;
    if (msg.type === 'open' && BP.get(msg.id)) BP.go(BP.aptUrl(BP.get(msg.id)));
    if (msg.type === 'ready') { sendFilter(false); sendCompare(); }
    if (msg.type === 'compare' && BP.get(msg.id)) { BP.compare.toggle(msg.id); sendCompare(); }
  });

  function amenityChips() {
    return BP.AMENITIES.map(function (m) {
      var on = state.amenities.indexOf(m.key) >= 0;
      return '<button type="button" class="chip' + (on ? ' is-on' : '') + '" data-amenity="' + m.key + '" aria-pressed="' + on + '">' + m.label + '</button>';
    }).join('');
  }
  function areaChips() {
    return ['<button type="button" class="chip' + (!state.area ? ' is-on' : '') + '" data-area="">전체</button>'].concat(BP.areas().map(function (a) {
      return '<button type="button" class="chip' + (state.area === a ? ' is-on' : '') + '" data-area="' + BP.esc(a) + '">' + BP.esc(a) + '</button>';
    })).join('');
  }

  BP.page('home', {
    title: '비교파트 · 실거주 데이터로 비교하는 아파트',
    render: function () {
      var menu = [
        { href: '#/about', icon: 'info', label: '비교파트 소개' },
        { href: '#/apartments', icon: 'building', label: '모든 아파트 보기' }
      ].concat(BP.TOOLS.map(function (t) { return { href: '#/' + t.route, icon: t.icon, label: t.title }; }));

      return '<div class="home">' +
        '<aside class="home-side" aria-label="메뉴와 필터">' +
          '<a class="brand side-brand" href="#/" aria-label="비교파트 홈">' + BP.logo + '<span>BigyoPateu</span></a>' +
          '<h1>살아본 사람의 데이터로 고르는 아파트</h1><p class="lede">서울 ' + BP.areas().length + '개 동, ' + BP.apartments.length + '개 단지를 지도에서 바로 비교해 보세요.</p>' +
          '<ul class="menu-list">' + menu.map(function (m) {
            return '<li><a href="' + m.href + '"><span class="icon-tile">' + BP.icon(m.icon, 'sm') + '</span>' + m.label + '</a></li>';
          }).join('') + '</ul>' +
          '<h2>지역</h2><div class="chip-row" data-area-chips>' + areaChips() + '</div>' +
          '<h2>커뮤니티 시설</h2><div class="chip-row" data-amenity-chips>' + amenityChips() + '</div>' +
        '</aside>' +
        '<section class="home-map" aria-label="아파트 지도">' +
          '<a class="brand map-brand" href="#/" aria-label="비교파트 홈">' + BP.logo + '<span>BigyoPateu</span></a>' +
          '<div class="map-count" aria-live="polite"><b data-map-count>' + count() + '</b>개 단지</div>' +
          '<iframe id="map-frame" title="아파트 위치 지도" src="' + mapSrc() + '" loading="eager"></iframe>' +
        '</section>' +
        '<div class="home-mobile-extra">' +
          '<h2>지역</h2><div class="chip-row" data-area-chips>' + areaChips() + '</div>' +
          '<h2>커뮤니티 시설</h2><div class="chip-row" data-amenity-chips>' + amenityChips() + '</div>' +
          '<h2>분석 도구</h2><div class="quick-grid">' + BP.TOOLS.map(function (t) {
            return '<a href="#/' + t.route + '"><span class="icon-tile">' + BP.icon(t.icon) + '</span>' + t.title + '</a>';
          }).join('') + '</div>' +
        '</div>' +
      '</div>';
    },
    mount: function (root) {
      document.querySelector('.app-footer').hidden = window.innerWidth > 760;
      root.addEventListener('click', function (e) {
        var am = e.target.closest('[data-amenity]');
        var ar = e.target.closest('[data-area]');
        if (am) {
          var k = am.getAttribute('data-amenity'), i = state.amenities.indexOf(k);
          if (i >= 0) state.amenities.splice(i, 1); else state.amenities.push(k);
        } else if (ar) {
          state.area = ar.getAttribute('data-area');
        } else return;
        root.querySelectorAll('[data-amenity-chips]').forEach(function (el) { el.innerHTML = amenityChips(); });
        root.querySelectorAll('[data-area-chips]').forEach(function (el) { el.innerHTML = areaChips(); });
        root.querySelector('[data-map-count]').textContent = count();
        sendFilter(!!ar);
      });
    }
  });

  // restore the footer when leaving home
  window.addEventListener('hashchange', function () {
    if (BP.parseHash().name !== 'home') document.querySelector('.app-footer').hidden = false;
  });
})();
