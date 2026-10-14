/* 비교하기: side-by-side spec sheet with the best value in each row marked */
(function () {
  'use strict';
  var esc = BP.esc;

  function ox(key) {
    return { label: BP.AMENITIES.filter(function (m) { return m.key === key; })[0].label, show: function (a) {
      if (key === 'playground' && a.playgroundCount) return '<span class="ox-yes">' + a.playgroundCount + '개</span>';
      return a[key] === true ? '<span class="ox-yes">있음</span>' : a[key] === false ? '<span class="ox-no">없음</span>' : null;
    } };
  }

  var GROUPS = [
    { title: '기본 정보', rows: [
      { label: '세대수', show: function (a) { return a.households && BP.n(a.households) + '세대'; }, value: function (a) { return a.households; }, better: 'high' },
      { label: '동수', show: function (a) { return a.buildings && a.buildings + '개동'; } },
      { label: '준공', show: function (a) { return a.approved && esc(a.approved) + ' (' + BP.age(a) + '년차)'; }, value: function (a) { return a.approvedYear; }, better: 'high' },
      { label: '세대당 주차', show: function (a) { return a.parkingPerHousehold && a.parkingPerHousehold + '대'; }, value: function (a) { return a.parkingPerHousehold; }, better: 'high' },
      { label: '월평균 관리비', show: function (a) { return a.feeAvg ? BP.won(a.feeAvg) : (a.fee ? esc(a.fee[0]) : null); }, value: function (a) { return a.feeAvg; }, better: 'low' },
      { label: '용적률', show: function (a) { return a.far != null && a.far + '%'; }, value: function (a) { return a.far; }, better: 'low' },
      { label: '건폐율', show: function (a) { return a.bcr != null && a.bcr + '%'; }, value: function (a) { return a.bcr; }, better: 'low' },
      { label: '건설사', show: function (a) { return a.builder && esc(a.builder); } },
      { label: '평형', show: function (a) { return a.sizes && esc(a.sizes.join(', ')); } }
    ] },
    { title: '교통', rows: [
      { label: '가까운 역', show: function (a) { return a.subway && esc(a.subway); } },
      { label: '역까지 도보', show: function (a) { return a.subwayMin != null && a.subwayMin + '분'; }, value: function (a) { return a.subwayMin; }, better: 'low' },
      { label: '강남역까지', show: function (a) { return a.toGangnam != null && a.toGangnam + '분'; }, value: function (a) { return a.toGangnam; }, better: 'low' },
      { label: '여의도역까지', show: function (a) { return a.toYeouido != null && a.toYeouido + '분'; }, value: function (a) { return a.toYeouido; }, better: 'low' },
      { label: '광화문역까지', show: function (a) { return a.toGwanghwamun != null && a.toGwanghwamun + '분'; }, value: function (a) { return a.toGwanghwamun; }, better: 'low' }
    ] },
    { title: '교육', rows: [
      { label: '교육 환경 점수', show: function (a) { return a.eduScore != null && a.eduScore + '점'; }, value: function (a) { return a.eduScore; }, better: 'high' },
      { label: '초등학교', show: function (a) { return a.elementary && esc(a.elementary); } },
      { label: '중학교', show: function (a) { return a.middle && esc(a.middle); } },
      { label: '고등학교', show: function (a) { return a.high && esc(a.high); } }
    ] },
    { title: '커뮤니티 시설', rows: BP.AMENITIES.map(function (m) { return ox(m.key); }) },
    { title: '생활 편의', rows: [
      { label: '편의점', show: function (a) { return a.convenience && esc(a.convenience); } },
      { label: '공원', show: function (a) { return a.park && esc(a.park); } },
      { label: '대학병원', show: function (a) { return a.hospital && esc(a.hospital); } },
      { label: '약국', show: function (a) { return a.pharmacy && esc(a.pharmacy); } }
    ] },
    { title: '비교파트 분석', rows: [
      { label: '재건축 가능성', show: function (a) { return a.rebuild && a.rebuild.total != null && a.rebuild.total + '점 · ' + a.rebuild.grade + '등급'; }, value: function (a) { return a.rebuild && a.rebuild.total; }, better: 'high' },
      { label: '저평가 점수', show: function (a) { return a.valueScore != null && a.valueScore + '점'; }, value: function (a) { return a.valueScore; }, better: 'high' }
    ] }
  ];

  function bestIndexes(row, apts) {
    if (!row.better || apts.length < 2) return [];
    var vals = apts.map(function (a) { var v = row.value(a); return v == null ? null : v; });
    var present = vals.filter(function (v) { return v != null; });
    if (present.length < 2) return [];
    var target = row.better === 'high' ? Math.max.apply(null, present) : Math.min.apply(null, present);
    if (present.every(function (v) { return v === target; })) return [];
    return vals.map(function (v, i) { return v === target ? i : -1; }).filter(function (i) { return i >= 0; });
  }

  function sheet(apts) {
    var head = '<thead><tr><th class="rowhead" scope="col"><span class="sr-only">항목</span></th>' + apts.map(function (a) {
      return '<th scope="col"><div class="apt-head">' + BP.photo(a) +
        '<a href="' + BP.aptUrl(a) + '">' + esc(a.name) + '</a><span class="hint">' + esc(a.dong || '') + '</span>' +
        '<button type="button" class="remove" data-remove="' + esc(a.id) + '">' + BP.icon('x', 'sm') + '빼기</button></div></th>';
    }).join('') + '</tr></thead>';

    var body = GROUPS.map(function (g) {
      var rows = g.rows.filter(function (r) { return apts.some(function (a) { return r.show(a); }); });
      if (!rows.length) return '';
      return '<tbody><tr class="group"><th class="rowhead" scope="rowgroup">' + g.title + '</th>' + apts.map(function () { return '<th></th>'; }).join('') + '</tr>' +
        rows.map(function (r) {
          var best = bestIndexes(r, apts);
          return '<tr><th class="rowhead" scope="row">' + r.label + '</th>' + apts.map(function (a, i) {
            var v = r.show(a);
            var isBest = v && best.indexOf(i) >= 0;
            return '<td class="' + (v ? (isBest ? 'best' : '') : 'na') + '">' + (v || '-') + (isBest ? '<span class="sr-only"> (가장 좋음)</span>' : '') + '</td>';
          }).join('') + '</tr>';
        }).join('') + '</tbody>';
    }).join('');
    return '<div class="sheet-wrap"><table class="sheet" style="min-width:' + (120 + apts.length * 170) + 'px">' + head + body + '</table></div>' +
      '<p class="legend"><i aria-hidden="true"></i>숫자로 비교할 수 있는 항목에서 가장 유리한 단지예요.</p>';
  }

  BP.page('compare', {
    title: '비교하기 | 비교파트',
    render: function (ctx) {
      if (ctx.query.ids) BP.compare.set(ctx.query.ids.split(','));
      var ids = BP.compare.list();
      var apts = ids.map(BP.get).filter(Boolean);
      var picker = '<div class="compare-picker">' +
        '<label><span class="sr-only">단지 추가</span><select class="select" data-add><option value="">단지 추가…</option>' +
        BP.aptOptions(null, { filter: function (a) { return ids.indexOf(a.id) < 0; } }) + '</select></label>' +
        '<span class="hint">최대 4개까지 비교할 수 있어요.</span></div>';

      return '<div class="page">' +
        '<div class="page-head"><div><h1>비교하기</h1><p>담은 단지를 항목별로 나란히 놓고, 각 항목에서 가장 유리한 단지를 표시해요.</p></div></div>' +
        picker +
        (apts.length ? sheet(apts) : '<div class="panel empty"><strong>비교할 단지를 담아 주세요</strong>위에서 단지를 고르거나, 아파트 목록에서 + 버튼을 눌러 담을 수 있어요.<br><br><a class="btn btn-primary" href="#/apartments">아파트 둘러보기</a></div>') +
        (apts.length === 1 ? '<p class="hint" style="margin-top:12px">한 개 더 담으면 어느 단지가 더 유리한지 표시돼요.</p>' : '') +
      '</div>';
    },
    mount: function (root) {
      root.querySelector('[data-add]').addEventListener('change', function (e) {
        if (!e.target.value) return;
        var list = BP.compare.list();
        if (list.length >= 4) { BP.toast('비교함에는 4개까지 담을 수 있어요'); return; }
        BP.compare.set(list.concat(e.target.value));
        BP.setQuery({});
        BP.render();
      });
      root.addEventListener('click', function (e) {
        var b = e.target.closest('[data-remove]'); if (!b) return;
        BP.compare.set(BP.compare.list().filter(function (id) { return id !== b.getAttribute('data-remove'); }));
        BP.setQuery({});
        BP.render();
      });
    },
    keepScroll: false
  });
})();
