/* 저평가 아파트 찾기 */
(function () {
  'use strict';
  var esc = BP.esc;

  var FEATURES = [
    ['주요 업무지구 접근성', '강남, 여의도, 광화문 등 일자리 지역과 가까운지'],
    ['학군·학원가 접근성', '학교, 학원, 도서관 등 교육 인프라가 괜찮은지'],
    ['초등/중/고등학교 도보권', '자녀가 있는 가족에게 특히 중요한 실거주 가치'],
    ['대단지 또는 안정적인 세대 수', '세대 수가 많아 관리, 커뮤니티, 거래량 측면에서 유리한지'],
    ['관리비가 낮은 단지', '실제 거주 비용이 낮아 오래 살기에 부담이 적은지'],
    ['주차 편의성', '세대당 주차대수가 충분하거나 주차 스트레스가 적은지'],
    ['공원·산책로 접근성', '쾌적한 주거 환경과 삶의 질을 높이는 요소'],
    ['생활 편의시설 접근성', '마트, 병원, 약국, 카페, 쇼핑몰 등 일상생활 인프라가 가까운지'],
    ['브랜드는 약하지만 입지가 좋은 단지', '유명 브랜드가 아니라서 저평가됐지만 실제 위치가 좋은 경우']
  ];

  function areas() {
    return BP.areas().filter(function (ar) { return BP.inArea(ar).some(function (a) { return a.valueScore != null; }); });
  }

  function results(area, picked) {
    var pool = BP.inArea(area).filter(function (a) { return a.valueScore != null; });
    var exact = pool.filter(function (a) { return picked.every(function (f) { return (a.valueFeatures || []).indexOf(f) >= 0; }); });
    var close = [];
    if (!exact.length) {
      close = pool.map(function (a) {
        return { a: a, hits: picked.filter(function (f) { return (a.valueFeatures || []).indexOf(f) >= 0; }).length };
      }).filter(function (x) { return x.hits > 0; })
        .sort(function (x, y) { return y.hits - x.hits || y.a.valueScore - x.a.valueScore; })
        .slice(0, 4).map(function (x) { return x.a; });
    }
    var byScore = function (x, y) { return y.valueScore - x.valueScore; };
    return { exact: exact.sort(byScore), close: close };
  }

  function card(a, picked) {
    var have = a.valueFeatures || [];
    return '<article class="panel value-card">' +
      '<header><span class="medal">' + a.valueScore + '</span><div><h3><a href="' + BP.aptUrl(a) + '">' + esc(a.name) + '</a></h3>' +
        '<div class="meta">' + [a.buildings && a.buildings + '개동', a.households && BP.n(a.households) + '세대', a.builder].filter(Boolean).map(esc).join(', ') + '</div></div></header>' +
      '<div class="chip-row">' + FEATURES.map(function (f) {
        var on = have.indexOf(f[0]) >= 0;
        var want = picked.indexOf(f[0]) >= 0;
        return '<span class="tag ' + (on ? 'blue' : 'off') + '"' + (want && on ? ' style="font-weight:800"' : '') + '>' + (on ? '' : '<span class="sr-only">해당 없음: </span>') + f[0] + '</span>';
      }).join('') + '</div>' +
      '<div class="actions">' + BP.compareButton(a) + '<a class="btn btn-ghost" href="' + BP.aptUrl(a) + '">상세 정보</a></div>' +
    '</article>';
  }

  BP.page('value', {
    title: '저평가 아파트 | 비교파트',
    render: function (ctx) {
      var list = areas();
      var area = list.indexOf(ctx.query.area) >= 0 ? ctx.query.area : list[0];
      var picked = (ctx.query.f || '').split('|').filter(function (f) { return FEATURES.some(function (x) { return x[0] === f; }); });

      if (ctx.query.f != null && picked.length) {
        var r = results(area, picked);
        var shown = r.exact.length ? r.exact : r.close;
        return '<div class="page">' +
          '<div class="page-head"><div><h1>' + (r.exact.length ? esc(area) + '에서 ' + r.exact.length + '개 단지가 조건에 맞아요' : '모든 조건에 맞는 단지는 없어요') + '</h1>' +
            '<p>' + (r.exact.length ? '저평가 점수가 높은 순서예요. 파란색 항목이 해당 단지의 강점이에요.' : '고른 조건을 가장 많이 갖춘 단지를 대신 보여드려요.') + '</p></div>' +
            '<a class="back-link" href="#/value?area=' + encodeURIComponent(area) + '&sel=' + encodeURIComponent(picked.join('|')) + '">' + BP.icon('back', 'sm') + '조건 다시 선택하기</a></div>' +
          (shown.length ? '<div class="value-results">' + shown.map(function (a) { return card(a, picked); }).join('') + '</div>'
            : '<div class="panel empty"><strong>' + esc(area) + '에는 이 조건을 갖춘 단지가 없어요</strong>조건을 줄이거나 다른 지역을 골라 보세요.</div>') +
        '</div>';
      }

      var sel = (ctx.query.sel || '').split('|');
      return '<div class="page narrow">' + BP.backLink('#/tools') +
        '<form class="panel" data-form>' +
          '<div class="page-head" style="margin-bottom:22px"><div><h1>저평가 아파트를 찾아보세요</h1><p>원하는 조건을 고르면 알짜배기 아파트를 비교파트가 찾아드려요.</p></div></div>' +
          '<label class="field" style="margin-bottom:24px"><span>지역</span><select class="select" name="area">' + list.map(function (a) {
            return '<option' + (a === area ? ' selected' : '') + '>' + esc(a) + '</option>';
          }).join('') + '</select></label>' +
          '<fieldset style="border:0;padding:0;margin:0"><legend style="font-weight:700;margin-bottom:10px;padding:0">아파트 특징 <span class="muted" style="font-weight:500">(원하는 항목을 모두 고르세요)</span></legend>' +
          '<div class="feature-grid">' + FEATURES.map(function (f) {
            return '<label class="feature"><input type="checkbox" name="f" value="' + esc(f[0]) + '"' + (sel.indexOf(f[0]) >= 0 ? ' checked' : '') + '><span><strong>' + f[0] + '</strong><small>' + f[1] + '</small></span></label>';
          }).join('') + '</div></fieldset>' +
          '<button class="btn btn-primary btn-block" type="submit" style="margin-top:24px" data-submit>찾아보기</button>' +
          '<p class="hint" style="text-align:center;margin:10px 0 0" data-help>항목을 1개 이상 골라 주세요</p>' +
        '</form></div>';
    },
    mount: function (root) {
      var form = root.querySelector('[data-form]');
      if (!form) return;
      function sync() {
        var n = form.querySelectorAll('input[name=f]:checked').length;
        form.querySelector('[data-submit]').disabled = !n;
        form.querySelector('[data-help]').textContent = n ? n + '개 조건을 모두 갖춘 단지를 찾아요' : '항목을 1개 이상 골라 주세요';
      }
      form.addEventListener('change', sync);
      sync();
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var f = Array.prototype.map.call(form.querySelectorAll('input[name=f]:checked'), function (i) { return i.value; });
        BP.go('#/value?area=' + encodeURIComponent(form.area.value) + '&f=' + encodeURIComponent(f.join('|')));
      });
    }
  });
})();
