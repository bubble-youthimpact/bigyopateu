/* 최적의 학군: 교육 환경 비교 */
(function () {
  'use strict';
  var esc = BP.esc;
  var MAX = 3;

  function defaultIds() {
    var tray = BP.compare.list().filter(function (id) { return BP.get(id).eduScore != null; });
    if (tray.length) return tray.slice(0, MAX);
    var first = BP.apartments.filter(function (a) { return a.eduScore != null; });
    return first.slice(0, 2).map(function (a) { return a.id; });
  }

  function tags(a) {
    var f = a.valueFeatures || [];
    var out = [];
    if (f.indexOf('학군·학원가 접근성') >= 0) out.push('<span class="tag pink">학원가 접근성</span>');
    if (f.indexOf('초등/중/고등학교 도보권') >= 0) out.push('<span class="tag green">학교 도보권</span>');
    if (a.library) out.push('<span class="tag blue">단지 내 도서관</span>');
    return out.join('');
  }

  function academyList(items) {
    if (!items || !items.length) return '<p class="muted" style="margin:0">정보가 아직 없어요.</p>';
    var nums = items.map(function (x) { return x.minutes != null ? x.minutes : x.meters; }).filter(function (v) { return v != null; });
    var min = nums.length ? Math.min.apply(null, nums) : null;
    return '<dl class="academy-list">' + items.map(function (x) {
      var v = x.minutes != null ? x.minutes : x.meters;
      return '<dt>' + esc(x.name) + '</dt><dd class="' + (v === min ? 'fast' : '') + '">' + esc(x.value) + '</dd>';
    }).join('') + '</dl>';
  }

  function column(a) {
    var schools = [['pencil', '초등학교', a.elementary], ['book', '중학교', a.middle], ['school', '고등학교', a.high], ['university', '대학교', a.university]];
    return '<div class="col">' +
      '<section class="panel col-head">' +
        '<h2><a href="' + BP.aptUrl(a) + '">' + esc(a.name) + '</a></h2>' +
        '<button type="button" class="icon-btn x" data-remove="' + esc(a.id) + '" aria-label="' + esc(a.name) + ' 빼기">' + BP.icon('x') + '</button>' +
        '<div class="score-row"><span class="medal' + (a.eduScore == null ? ' muted' : '') + '">' + (a.eduScore != null ? a.eduScore : '-') + '</span>' +
          '<div><div class="label">교육 환경 점수</div><div class="value">' + (a.eduScore != null ? a.eduScore + '점' : '준비 중') + '</div></div></div>' +
        '<div class="chip-row">' + tags(a) + '</div>' +
      '</section>' +
      '<section class="panel"><h3 class="panel-title">학교 접근성</h3><ul class="school-list">' + schools.map(function (s) {
        return '<li><span class="icon-tile">' + BP.icon(s[0]) + '</span><div><small>' + s[1] + '</small><span>' + BP.dash(s[2]) + '</span></div></li>';
      }).join('') + '</ul></section>' +
      '<section class="panel"><h3 class="panel-title">대표 수학 학원 접근성</h3>' + academyList(a.mathAcademies) + '</section>' +
      '<section class="panel"><h3 class="panel-title">대표 영어 학원 접근성</h3>' + academyList(a.engAcademies) + '</section>' +
    '</div>';
  }

  BP.page('school', {
    title: '최적의 학군 | 비교파트',
    render: function (ctx) {
      var ids = (ctx.query.ids != null ? ctx.query.ids.split(',') : defaultIds()).filter(BP.get).slice(0, MAX);
      var apts = ids.map(BP.get);
      return '<div class="page">' + BP.backLink('#/tools') +
        '<div class="page-head"><div><h1>최적의 학군</h1><p>학교까지의 거리, 대표 학원까지 걸리는 시간을 단지별로 나란히 비교해요. 가장 가까운 학원은 파란색으로 표시돼요.</p></div>' +
        '<label><span class="sr-only">단지 추가</span><select class="select" data-add style="min-width:220px"' + (apts.length >= MAX ? ' disabled' : '') + '><option value="">' + (apts.length >= MAX ? '최대 3개까지 비교할 수 있어요' : '단지 추가…') + '</option>' +
          BP.aptOptions(null, { filter: function (a) { return ids.indexOf(a.id) < 0 && a.eduScore != null; } }) + '</select></label></div>' +
        (apts.length ? '<div class="cols" style="--n:' + apts.length + '">' + apts.map(column).join('') + '</div>'
          : '<div class="panel empty"><strong>비교할 단지를 골라 주세요</strong>오른쪽 위에서 단지를 추가하면 교육 환경을 비교할 수 있어요.</div>') +
      '</div>';
    },
    mount: function (root, ctx) {
      var ids = (ctx.query.ids != null ? ctx.query.ids.split(',') : defaultIds()).filter(BP.get).slice(0, MAX);
      function go(next) { BP.go('#/school?ids=' + next.map(encodeURIComponent).join(',')); }
      root.querySelector('[data-add]').addEventListener('change', function (e) { if (e.target.value) go(ids.concat(e.target.value)); });
      root.addEventListener('click', function (e) {
        var b = e.target.closest('[data-remove]'); if (b) go(ids.filter(function (id) { return id !== b.getAttribute('data-remove'); }));
      });
    }
  });
})();
