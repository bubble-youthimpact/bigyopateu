/* 저평가 아파트 찾기 */
(function () {
  'use strict';
  var esc = BP.esc;

  var FEATURES = [
    ['주요 업무지구 접근성', '강남, 여의도, 광화문 등 일자리 지역과 가까운지', 'building'],
    ['학군·학원가 접근성', '학교, 학원, 도서관 등 교육 인프라가 괜찮은지', 'school'],
    ['초등/중/고등학교 도보권', '자녀가 있는 가족에게 특히 중요한 실거주 가치', 'pencil'],
    ['대단지 또는 안정적인 세대 수', '세대 수가 많아 관리, 커뮤니티, 거래량 측면에서 유리한지', 'tools'],
    ['관리비가 낮은 단지', '실제 거주 비용이 낮아 오래 살기에 부담이 적은지', 'wallet'],
    ['주차 편의성', '세대당 주차대수가 충분하거나 주차 스트레스가 적은지', 'car'],
    ['공원·산책로 접근성', '쾌적한 주거 환경과 삶의 질을 높이는 요소', 'tree'],
    ['생활 편의시설 접근성', '마트, 병원, 약국, 카페, 쇼핑몰 등 일상생활 인프라가 가까운지', 'store'],
    ['브랜드는 약하지만 입지가 좋은 단지', '유명 브랜드가 아니라서 저평가됐지만 실제 위치가 좋은 경우', 'gem']
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

  function card(a, picked, rank) {
    var have = a.valueFeatures || [];
    var others = FEATURES.map(function (f) { return f[0]; }).filter(function (f) { return picked.indexOf(f) < 0 && have.indexOf(f) >= 0; });
    var met = picked.filter(function (f) { return have.indexOf(f) >= 0; }).length;
    return '<article class="vr-card">' +
      '<a class="vr-photo" href="' + BP.aptUrl(a) + '" tabindex="-1" aria-hidden="true">' + BP.photo(a) + '<span class="vr-rank">' + rank + '위</span></a>' +
      '<div class="vr-body">' +
        '<header class="vr-head">' +
          '<div><small>' + esc(a.dong || '') + '</small><h3><a href="' + BP.aptUrl(a) + '">' + esc(a.name) + '</a></h3></div>' +
          '<div class="vr-score"><span class="medal sm">' + a.valueScore + '</span><small>저평가 점수</small></div>' +
        '</header>' +
        '<dl class="vr-stats">' +
          '<div><dt>세대수</dt><dd>' + (a.households ? BP.n(a.households) + '세대' : '-') + '</dd></div>' +
          '<div><dt>준공</dt><dd>' + (a.approvedYear ? a.approvedYear + '년' : '-') + '</dd></div>' +
          '<div><dt>건설사</dt><dd>' + BP.dash(a.builder) + '</dd></div>' +
        '</dl>' +
        '<div class="vr-section"><p class="vr-label">고른 조건 <b>' + met + '/' + picked.length + '</b></p><ul class="vr-checks">' + picked.map(function (f) {
          var ok = have.indexOf(f) >= 0;
          return '<li class="' + (ok ? 'ok' : 'no') + '">' + BP.icon(ok ? 'check' : 'x', 'sm') + '<span>' + f + '</span><span class="sr-only">' + (ok ? ' 충족' : ' 미충족') + '</span></li>';
        }).join('') + '</ul></div>' +
        (others.length ? '<div class="vr-section"><p class="vr-label">그 밖의 강점</p><div class="chip-row">' + others.map(function (f) { return '<span class="tag blue">' + f + '</span>'; }).join('') + '</div></div>' : '') +
        '<div class="vr-actions">' + BP.compareButton(a) + '<a class="btn btn-ghost" href="' + BP.aptUrl(a) + '">상세 정보 보기</a></div>' +
      '</div>' +
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
        var again = '#/value?area=' + encodeURIComponent(area) + '&sel=' + encodeURIComponent(picked.join('|'));
        return '<div class="page">' + BP.backLink(again, '조건 다시 선택하기') +
          '<div class="page-head"><div><h1>' + (r.exact.length ? esc(area) + '에서 ' + r.exact.length + '개 단지가 조건에 맞아요' : '모든 조건에 맞는 단지는 없어요') + '</h1>' +
            '<p>' + (r.exact.length ? '저평가 점수가 높은 순서로 보여드려요.' : '고른 조건을 가장 많이 갖춘 단지를 대신 보여드려요.') + '</p></div></div>' +
          '<div class="vr-summary"><div><span class="vr-label">지역</span><span class="chip is-on">' + esc(area) + '</span></div>' +
            '<div><span class="vr-label">고른 조건</span><div class="chip-row">' + picked.map(function (f) { return '<span class="chip is-on">' + f + '</span>'; }).join('') + '</div></div>' +
            '<a class="btn btn-ghost btn-sm" href="' + again + '">조건 바꾸기</a></div>' +
          (shown.length ? '<div class="vr-list">' + shown.map(function (a, i) { return card(a, picked, i + 1); }).join('') + '</div>'
            : '<div class="panel empty"><strong>' + esc(area) + '에는 이 조건을 갖춘 단지가 없어요</strong>조건을 줄이거나 다른 지역을 골라 보세요.</div>') +
        '</div>';
      }

      var sel = (ctx.query.sel || '').split('|');
      return '<div class="page">' + BP.backLink('#/tools') +
        '<form class="vf" data-form>' +
          '<aside class="vf-side">' +
            '<h1>저평가 아파트를 찾아보세요</h1>' +
            '<p class="vf-lede">원하는 조건을 고르면 그 조건을 모두 갖춘 알짜배기 단지를 비교파트가 찾아드려요.</p>' +
            '<fieldset class="vf-areas"><legend>지역</legend><div class="chip-row">' + list.map(function (a, i) {
              return '<label class="vf-area"><input type="radio" name="area" value="' + esc(a) + '"' + (a === area ? ' checked' : '') + '><span>' + esc(a) + '</span></label>';
            }).join('') + '</div></fieldset>' +
            '<div class="vf-live" aria-live="polite"><small data-live-label></small><strong><b data-live-count>0</b>개 단지</strong></div>' +
            '<div class="vf-picked" data-picked></div>' +
            '<button class="btn btn-primary btn-block vf-submit" type="submit" data-submit>' + BP.icon('search', 'sm') + '조건에 맞는 단지 보기</button>' +
          '</aside>' +
          '<section class="vf-main">' +
            '<div class="vf-main-head"><h2>원하는 특징을 모두 고르세요</h2><button type="button" class="vf-clear" data-clear>모두 해제</button></div>' +
            '<div class="vf-grid">' + FEATURES.map(function (f, i) {
              return '<label class="vf-feature"><input type="checkbox" name="f" value="' + esc(f[0]) + '"' + (sel.indexOf(f[0]) >= 0 ? ' checked' : '') + '>' +
                '<span class="vf-icon">' + BP.icon(f[2]) + '</span>' +
                '<span class="vf-text"><strong>' + f[0] + '</strong><small>' + f[1] + '</small></span>' +
                '<span class="vf-check" aria-hidden="true">' + BP.icon('check', 'sm') + '</span></label>';
            }).join('') + '</div>' +
            '<button class="btn btn-primary btn-block vf-submit-m" type="submit" data-submit>' + BP.icon('search', 'sm') + '조건에 맞는 단지 보기</button>' +
          '</section>' +
        '</form></div>';
    },
    mount: function (root) {
      var form = root.querySelector('[data-form]');
      if (!form) return;
      function picked() { return Array.prototype.map.call(form.querySelectorAll('input[name=f]:checked'), function (i) { return i.value; }); }
      function area() { var r = form.querySelector('input[name=area]:checked'); return r ? r.value : ''; }
      function sync() {
        var f = picked(), ar = area();
        var pool = BP.inArea(ar).filter(function (a) { return a.valueScore != null; });
        var hits = pool.filter(function (a) { return f.every(function (x) { return (a.valueFeatures || []).indexOf(x) >= 0; }); });
        form.querySelector('[data-live-label]').textContent = f.length ? ar + '에서 조건을 모두 갖춘' : ar + '의 분석 대상';
        form.querySelector('[data-live-count]').textContent = hits.length;
        form.querySelector('[data-picked]').innerHTML = f.length
          ? f.map(function (x) { return '<span class="chip">' + esc(x) + '</span>'; }).join('')
          : '<p>오른쪽에서 특징을 1개 이상 골라 주세요.</p>';
        form.querySelectorAll('[data-submit]').forEach(function (b) { b.disabled = !f.length; });
      }
      form.addEventListener('change', sync);
      form.querySelector('[data-clear]').addEventListener('click', function () {
        form.querySelectorAll('input[name=f]').forEach(function (i) { i.checked = false; });
        sync();
      });
      sync();
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        BP.go('#/value?area=' + encodeURIComponent(area()) + '&f=' + encodeURIComponent(picked().join('|')));
      });
    }
  });
})();
