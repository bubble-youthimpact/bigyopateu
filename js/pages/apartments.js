/* 모든 아파트 + 아파트 상세 */
(function () {
  'use strict';
  var esc = BP.esc, dash = BP.dash;

  var SORTS = {
    name: { label: '이름순', fn: function (a, b) { return a.name.localeCompare(b.name, 'ko'); } },
    households: { label: '세대수 많은 순', fn: function (a, b) { return (b.households || 0) - (a.households || 0); } },
    newest: { label: '최근 준공 순', fn: function (a, b) { return (b.approvedYear || 0) - (a.approvedYear || 0); } },
    subway: { label: '역에서 가까운 순', fn: function (a, b) { return (a.subwayMin == null ? 999 : a.subwayMin) - (b.subwayMin == null ? 999 : b.subwayMin); } }
  };

  BP.aptCard = function (a, extra) {
    return '<article class="apt-card">' +
      '<div class="add-compare">' + BP.compareButton(a, true) + '</div>' +
      '<a href="' + BP.aptUrl(a) + '">' +
        '<div style="position:relative">' + BP.photo(a) + '<div class="over"><small>' + esc(a.dong || '') + '</small><h3>' + esc(a.name) + '</h3></div></div>' +
        '<div class="body">' + (extra || '<dl class="stats">' +
          '<div><dt>세대수</dt><dd>' + (a.households ? BP.n(a.households) + '세대' : '-') + '</dd></div>' +
          '<div><dt>동수</dt><dd>' + (a.buildings ? a.buildings + '개동' : '-') + '</dd></div>' +
          '<div><dt>준공</dt><dd>' + (a.approvedYear ? a.approvedYear + '년' : '-') + '</dd></div>' +
        '</dl>') + '</div>' +
      '</a></article>';
  };

  function filtered(q) {
    var term = (q.q || '').trim().toLowerCase();
    var amen = (q.amenities || '').split(',').filter(Boolean);
    var list = BP.apartments.filter(function (a) {
      return (!q.area || a.dong === q.area) &&
        (!term || a.name.toLowerCase().indexOf(term) >= 0 || (a.dong || '').indexOf(term) >= 0 || (a.builder || '').toLowerCase().indexOf(term) >= 0) &&
        BP.hasAll(a, amen);
    });
    return list.sort((SORTS[q.sort] || SORTS.name).fn);
  }

  function listHtml(q) {
    var list = filtered(q);
    if (!list.length) {
      return '<div class="panel empty"><strong>조건에 맞는 단지가 없어요</strong>검색어를 줄이거나 시설 필터를 해제해 보세요.</div>';
    }
    return '<p class="result-count">' + (q.area ? esc(q.area) + ' ' : '') + '<b>' + list.length + '</b>개 단지</p>' +
      '<div class="apt-grid">' + list.map(function (a) { return BP.aptCard(a); }).join('') + '</div>';
  }

  BP.page('apartments', {
    title: '모든 아파트 | 비교파트',
    render: function (ctx) {
      var q = ctx.query;
      var amen = (q.amenities || '').split(',').filter(Boolean);
      return '<div class="page">' +
        '<div class="page-head"><div><h1>모든 아파트</h1><p>' + BP.areas().map(esc).join(', ') + '의 ' + BP.apartments.length + '개 단지를 실거주 데이터로 살펴보세요.</p></div></div>' +
        '<div class="list-toolbar">' +
          '<label class="search-box">' + BP.icon('search') + '<span class="sr-only">키워드 검색</span><input class="input" type="search" name="q" placeholder="단지명, 지역, 건설사로 검색" value="' + esc(q.q || '') + '" autocomplete="off"></label>' +
          '<label><span class="sr-only">지역</span><select class="select" name="area"><option value="">전체 지역</option>' + BP.areas().map(function (a) { return '<option' + (q.area === a ? ' selected' : '') + '>' + esc(a) + '</option>'; }).join('') + '</select></label>' +
          '<label><span class="sr-only">정렬</span><select class="select" name="sort">' + Object.keys(SORTS).map(function (k) { return '<option value="' + k + '"' + ((q.sort || 'name') === k ? ' selected' : '') + '>' + SORTS[k].label + '</option>'; }).join('') + '</select></label>' +
        '</div>' +
        '<div class="chip-row filter-strip" aria-label="커뮤니티 시설 필터">' + BP.AMENITIES.map(function (m) {
          var on = amen.indexOf(m.key) >= 0;
          return '<button type="button" class="chip' + (on ? ' is-on' : '') + '" data-amenity="' + m.key + '" aria-pressed="' + on + '">' + m.label + '</button>';
        }).join('') + '</div>' +
        '<div data-list>' + listHtml(q) + '</div>' +
      '</div>';
    },
    mount: function (root, ctx) {
      var q = Object.assign({}, ctx.query);
      var list = root.querySelector('[data-list]');
      function update() { BP.setQuery(q); list.innerHTML = listHtml(q); BP.refreshTray(); }
      root.querySelector('input[name=q]').addEventListener('input', function (e) { q.q = e.target.value; update(); });
      root.querySelector('select[name=area]').addEventListener('change', function (e) { q.area = e.target.value; update(); });
      root.querySelector('select[name=sort]').addEventListener('change', function (e) { q.sort = e.target.value; update(); });
      root.querySelector('.filter-strip').addEventListener('click', function (e) {
        var b = e.target.closest('[data-amenity]'); if (!b) return;
        var amen = (q.amenities || '').split(',').filter(Boolean), k = b.getAttribute('data-amenity'), i = amen.indexOf(k);
        if (i >= 0) amen.splice(i, 1); else amen.push(k);
        q.amenities = amen.join(',');
        b.classList.toggle('is-on', i < 0); b.setAttribute('aria-pressed', i < 0);
        update();
      });
    }
  });

  /* ---------- detail ---------- */
  function kv(rows) {
    return '<dl class="kv">' + rows.filter(function (r) { return r; }).map(function (r) {
      var v = Array.isArray(r[1]) ? '<ul class="sub-list">' + r[1].map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : r[1];
      return '<dt>' + r[0] + '</dt><dd>' + (v == null || v === '' ? '-' : v) + '</dd>';
    }).join('') + '</dl>';
  }

  function timeBars(a) {
    var rows = [['강남역', a.toGangnam], ['여의도역', a.toYeouido], ['광화문역', a.toGwanghwamun]].filter(function (r) { return r[1] != null; });
    if (!rows.length) return '<p class="muted">이동시간 정보가 아직 없어요.</p>';
    return '<div class="time-bars">' + rows.map(function (r) {
      return '<div class="time-bar"><span>' + r[0] + '</span><div class="track"><div class="fill" style="width:' + Math.min(100, r[1] / 60 * 100) + '%"></div></div><b>' + r[1] + '분</b></div>';
    }).join('') + '</div>';
  }

  BP.page('apt', {
    title: function (ctx) { var a = BP.get(ctx.params[0]); return (a ? a.name : '아파트') + ' | 비교파트'; },
    render: function (ctx) {
      var a = BP.get(ctx.params[0]);
      if (!a) return BP.pages.notfound.render();
      var age = BP.age(a);
      var amenityHtml = BP.AMENITIES.map(function (m) {
        var v = a[m.key];
        var label = m.label + (m.key === 'playground' && a.playgroundCount ? ' ' + a.playgroundCount + '개' : '');
        return '<div class="amenity ' + (v === true ? 'yes' : v === false ? '' : 'unknown') + '"><span class="dot"></span>' + label + '</div>';
      }).join('');

      var schoolRows = [['초등학교', dash(a.elementary)], ['중학교', dash(a.middle)], ['고등학교', dash(a.high)], ['인근 대학교', dash(a.university)]];
      var rb = a.rebuild;

      var basic = [
        ['세대수', a.households ? BP.n(a.households) + '세대' + (a.householdsNote ? ' (' + esc(a.householdsNote) + ')' : '') : null],
        ['동수', a.buildings ? a.buildings + '개동' : null],
        ['주차대수', a.parking ? BP.n(a.parking) + '대' + (a.parkingPerHousehold ? ' (세대당 ' + a.parkingPerHousehold + '대)' : '') : null],
        ['평형', a.sizes ? esc(a.sizes.join(', ')) : null],
        ['건설사', dash(a.builder)],
        ['사용승인일', dash(a.approved)]
      ];
      var basic2 = [
        ['공급', a.supplyArea || null],
        ['전용', a.exclusiveArea || null],
        ['용적률', a.far != null ? a.far + '%' : null],
        ['건폐율', a.bcr != null ? a.bcr + '%' : null],
        ['관리비', a.fee || null]
      ];

      return '<div class="page">' + BP.backLink('#/apartments') +
        '<section class="detail-hero">' + BP.photo(a) +
          '<div class="hero-text">' +
            '<div><span class="area">' + esc(a.dong || '') + '</span><h1>' + esc(a.name) + '</h1>' +
              '<p class="sub">' + [a.builder, a.approved && a.approved + ' 사용승인'].filter(Boolean).map(esc).join(', ') + '</p></div>' +
            '<div class="detail-actions">' + BP.compareButton(a) +
              '<a class="btn btn-ghost" href="#/commute?id=' + encodeURIComponent(a.id) + '">' + BP.icon('clock', 'sm') + '출퇴근 분석</a>' +
            '</div>' +
          '</div>' +
        '</section>' +
        '<dl class="keyfacts">' +
          '<div><dt>세대수</dt><dd>' + (a.households ? BP.n(a.households) + '<small>세대</small>' : '-') + '</dd></div>' +
          '<div><dt>동수</dt><dd>' + (a.buildings ? a.buildings + '<small>개동</small>' : '-') + '</dd></div>' +
          '<div><dt>준공 후</dt><dd>' + (age != null ? age + '<small>년</small>' : '-') + '</dd></div>' +
          '<div><dt>지하철역까지 도보</dt><dd>' + (a.subwayMin != null ? a.subwayMin + '<small>분</small>' : '-') + '</dd></div>' +
        '</dl>' +
        (a.review ? '<figure class="verdict">' + BP.icon('message') + '<figcaption><p>' + esc(a.review) + '</p><small>비교파트 한줄평</small></figcaption></figure>' : '') +

        '<div class="detail-grid">' +
          '<section class="panel span-2"><h2 class="panel-title">기본 정보</h2><div class="kv-2col">' + kv(basic) + kv(basic2) + '</div></section>' +

          '<section class="panel"><h2 class="panel-title">대중교통과 업무지구</h2>' + kv([
            ['가까운 지하철역', dash(a.subway)],
            ['역까지 도보', a.subwayMin != null ? a.subwayMin + '분' : null]
          ]) + '<div style="margin-top:20px">' + timeBars(a) + '</div>' +
          '<p class="hint" style="margin:16px 0 0"><a href="#/commute?id=' + encodeURIComponent(a.id) + '">출퇴근 스트레스 등급 보기</a></p></section>' +

          '<section class="panel"><h2 class="panel-title">교육 시설</h2>' +
            (a.eduScore != null ? '<div class="score-row" style="margin-bottom:18px"><span class="medal sm">' + a.eduScore + '</span><div><div class="label">교육 환경 점수</div><div style="font-weight:750">' + a.eduScore + '점</div></div></div>' : '') +
            kv(schoolRows) +
            '<p class="hint" style="margin:16px 0 0"><a href="#/school?ids=' + encodeURIComponent(a.id) + '">학원까지 거리와 함께 비교하기</a></p></section>' +

          '<section class="panel span-2"><h2 class="panel-title">커뮤니티와 편의시설</h2>' +
            '<div class="amenity-grid">' + amenityHtml + '</div>' + kv([
              ['편의점', dash(a.convenience)], ['공원', dash(a.park)], ['가까운 대학병원', dash(a.hospital)], ['가까운 약국', dash(a.pharmacy)], ['인근 동물병원', dash(a.vet)]
            ]) + '</section>' +

          ((rb || a.valueScore != null) ? '<section class="panel span-2"><h2 class="panel-title">비교파트 분석</h2><div class="cols" style="--n:2">' +
            (rb && rb.total != null ? '<div class="score-row"><span class="medal sm">' + rb.total + '</span><div><div class="label">재건축 가능성</div><div style="font-weight:750">' + (rb.grade ? rb.grade + '등급' : '') + ' <a class="hint" href="#/rebuild?ids=' + encodeURIComponent(a.id) + '">자세히</a></div></div></div>' : '') +
            (a.valueScore != null ? '<div class="score-row"><span class="medal sm">' + a.valueScore + '</span><div><div class="label">저평가 점수</div><div style="font-weight:750">' + a.valueScore + '점 <a class="hint" href="#/value?area=' + encodeURIComponent(a.dong || '') + '">비슷한 단지 찾기</a></div></div></div>' : '') +
          '</div></section>' : '') +
        '</div>' +
      '</div>';
    }
  });
})();
