/* 재건축 가능성 */
(function () {
  'use strict';
  var esc = BP.esc;
  var MAX = 3;

  var CRITERIA = [
    { key: 'age', icon: 'calendar', title: '노후도', desc: '낡은 정도와 경과 연수를 봐요.', scale: ['25년 미만', '25~29년', '30~34년', '35~39년', '40년 이상'],
      actual: function (a) { var y = BP.age(a); return y != null ? '준공 ' + y + '년차' : null; } },
    { key: 'market', icon: 'chart', title: '시장성', desc: '주변 아파트의 평균 시세로 사업성을 분석해요.', scale: ['4억 원 미만', '4억~7억 원 미만', '7억~10억 원 미만', '10억~15억 원 미만', '15억 원 이상'],
      actual: function () { return null; } },
    { key: 'far', icon: 'building', title: '개발 여력', desc: '현재 용적률로 추가 개발 가능성을 분석해요.', scale: ['220% 초과', '191~220%', '171~190%', '151~170%', '150% 이하'],
      actual: function (a) { return a.far != null ? '용적률 ' + a.far + '%' : null; } },
    { key: 'scale', icon: 'tools', title: '단지 특성', desc: '전체 세대수로 사업 규모와 효율성을 평가해요.', scale: ['300세대 미만', '300~699세대', '700~999세대', '1,000~1,499세대', '1,500세대 이상'],
      actual: function (a) { return a.households ? BP.n(a.households) + '세대' : null; } },
    { key: 'location', icon: 'train', title: '입지', desc: '가장 가까운 지하철역까지의 거리를 평가해요.', scale: ['1.5km 초과', '1km~1.5km', '801m~1km', '501~800m', '500m 이하'],
      actual: function (a) { return a.subwayM != null ? '역까지 ' + BP.n(a.subwayM) + 'm' : null; } },
    { key: 'finance', icon: 'wallet', title: '개인 재정', desc: '내 연봉으로 향후 추가분담금 대응 여력을 참고 지표로 보여줘요.', scale: ['2,000만 원 미만', '2,000만~2,999만 원', '3,000만~3,999만 원', '4,000만~4,999만 원', '5,000만 원 이상'],
      actual: function () { return null; } }
  ];
  var GRADES = [[26, 30], [21, 25], [16, 20], [11, 15], [6, 10]];

  function financeScore(salary) {
    if (salary == null || isNaN(salary)) return null;
    return salary >= 5000 ? 5 : salary >= 4000 ? 4 : salary >= 3000 ? 3 : salary >= 2000 ? 2 : 1;
  }
  function scores(a, salary) {
    var rb = Object.assign({}, a.rebuild || {});
    var f = financeScore(salary);
    if (f != null) rb.finance = f;
    var keys = CRITERIA.map(function (c) { return c.key; });
    var complete = keys.every(function (k) { return rb[k] != null; });
    rb.total = complete ? keys.reduce(function (s, k) { return s + rb[k]; }, 0) : null;
    rb.grade = rb.total != null ? GRADES.findIndex(function (g) { return rb.total >= g[0] && rb.total <= g[1]; }) + 1 : null;
    return rb;
  }

  function scaleList(c, score) {
    return '<ul class="scale-list">' + c.scale.map(function (label, i) { return { n: i + 1, label: label }; }).reverse().map(function (s) {
      return '<li class="' + (s.n === score ? 'hit' : '') + '"><b>' + s.n + '</b>' + s.label + '</li>';
    }).join('') + '</ul>';
  }

  function landingCriteria() {
    return '<div class="criteria-grid">' + CRITERIA.map(function (c) {
      return '<div class="criterion"><header><span class="icon-tile">' + BP.icon(c.icon, 'sm') + '</span><h3>' + c.title + '</h3></header><p>' + c.desc + '</p>' + scaleList(c, null) + '</div>';
    }).join('') + '</div>';
  }

  function column(a, salary) {
    var rb = scores(a, salary);
    return '<div class="col">' +
      '<section class="panel col-head"><h2><a href="' + BP.aptUrl(a) + '">' + esc(a.name) + '</a></h2>' +
        '<button type="button" class="icon-btn x" data-remove="' + esc(a.id) + '" aria-label="' + esc(a.name) + ' 빼기">' + BP.icon('x') + '</button>' +
        '<div class="grade-row"><span class="medal' + (rb.total == null ? ' muted' : '') + '">' + (rb.total != null ? rb.total : '-') + '</span>' +
          '<div><div class="grade">' + (rb.grade ? rb.grade + '등급' : '준비 중') + '</div><div class="grade-note">' + (rb.total != null ? '30점 만점' : '점수 데이터가 아직 없어요') + '</div></div></div>' +
      '</section>' +
      CRITERIA.map(function (c) {
        var s = rb[c.key], actual = c.actual(a);
        if (c.key === 'finance' && salary) actual = '연봉 ' + BP.n(salary) + '만 원';
        return '<section class="panel criterion"><header><span class="icon-tile">' + BP.icon(c.icon, 'sm') + '</span><h3>' + c.title + '</h3></header>' +
          '<div class="rb-score"><strong>' + (s != null ? s + '점' : '-') + '</strong>' + (actual ? '<span>' + esc(actual) + '</span>' : '') + '</div>' +
          scaleList(c, s) + '</section>';
      }).join('') +
    '</div>';
  }

  BP.page('rebuild', {
    title: '재건축 가능성 | 비교파트',
    render: function (ctx) {
      var ids = (ctx.query.ids || '').split(',').filter(BP.get).slice(0, MAX);
      var salary = ctx.query.salary ? parseInt(ctx.query.salary, 10) : (BP.store.get('salary', null));
      var apts = ids.map(BP.get);
      var picker = '<label><span class="sr-only">단지 추가</span><select class="select" data-add' + (apts.length >= MAX ? ' disabled' : '') + '><option value="">' + (apts.length >= MAX ? '최대 3개까지 비교할 수 있어요' : (apts.length ? '단지 추가…' : '아파트를 선택하세요')) + '</option>' +
        BP.aptOptions(null, { filter: function (a) { return ids.indexOf(a.id) < 0 && a.rebuild; } }) + '</select></label>';
      var salaryBox = '<form class="salary-box" data-salary><label class="field"><span>내 연봉 <span class="muted" style="font-weight:500">(만 원, 선택)</span></span>' +
        '<input class="input" name="salary" type="number" inputmode="numeric" min="0" step="100" placeholder="예: 4500" value="' + (salary || '') + '"></label>' +
        '<button class="btn btn-primary" type="submit">개인 재정 반영하기</button>' +
        '<p class="hint" style="grid-column:1/-1;margin:0">입력하지 않으면 기본값으로 계산해요. 연봉은 이 기기에만 저장돼요.</p></form>';

      if (!apts.length) {
        return '<div class="page">' + BP.backLink('#/tools') +
          '<section class="panel rebuild-hero">' +
            '<h1>우리 아파트, 재건축 가능성은 얼마나 될까요?</h1>' +
            '<p>용적률, 노후도, 시장성, 입지, 단지 규모와 개인 재정을 바탕으로 재건축 가능성을 간편하게 분석해 보세요.</p>' +
            '<div style="max-width:440px;margin:0 auto 34px">' + picker + '</div>' +
            '<div style="text-align:left">' + landingCriteria() + '</div>' +
            '<div style="text-align:left;margin-top:22px"><h2 class="panel-title">등급 기준</h2><div class="grade-scale">' + GRADES.map(function (g, i) {
              return '<div><b>' + (i + 1) + '등급</b>' + g[0] + '~' + g[1] + '점</div>';
            }).join('') + '</div></div>' +
          '</section></div>';
      }

      return '<div class="page">' + BP.backLink('#/rebuild', '처음으로') +
        '<div class="page-head"><div><h1>재건축 가능성 비교</h1><p>여섯 가지 기준을 각각 1~5점으로 매겨 합산해요. 점수가 높을수록 재건축 가능성이 높아요.</p></div>' + picker + '</div>' +
        salaryBox +
        '<div class="cols" style="--n:' + apts.length + ';margin-top:16px">' + apts.map(function (a) { return column(a, salary); }).join('') + '</div>' +
        '<p class="hint" style="margin-top:16px">재건축 가능성은 공개 데이터로 계산한 참고 지표예요. 실제 사업 추진 여부는 조합, 인허가, 시장 상황에 따라 달라져요.</p>' +
      '</div>';
    },
    mount: function (root, ctx) {
      var ids = (ctx.query.ids || '').split(',').filter(BP.get).slice(0, MAX);
      function go(next, salary) {
        var q = '#/rebuild?ids=' + next.map(encodeURIComponent).join(',');
        if (salary) q += '&salary=' + salary;
        BP.go(q);
      }
      var cur = ctx.query.salary || BP.store.get('salary', '');
      root.querySelector('[data-add]').addEventListener('change', function (e) { if (e.target.value) go(ids.concat(e.target.value), cur); });
      root.addEventListener('click', function (e) {
        var b = e.target.closest('[data-remove]'); if (b) go(ids.filter(function (id) { return id !== b.getAttribute('data-remove'); }), cur);
      });
      var form = root.querySelector('[data-salary]');
      if (form) form.addEventListener('submit', function (e) {
        e.preventDefault();
        var v = parseInt(form.salary.value, 10);
        BP.store.set('salary', isNaN(v) ? null : v);
        go(ids, isNaN(v) ? '' : v);
      });
    }
  });
})();
