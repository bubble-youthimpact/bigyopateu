/* 소개 + 한줄평 */
(function () {
  'use strict';
  var esc = BP.esc;

  BP.page('about', {
    title: '비교파트 소개',
    render: function () {
      var why = [
        { img: 'images/about/real-data.jpg', title: '진짜 살아본 사람들의 데이터', points: ['사람들이 직접 살면서 남긴 경험을 데이터로 정리했어요.', '지도나 가격만 봐서는 알 수 없는 차이가 보여요.'] },
        { img: 'images/about/recommend.jpg', title: '나에게 맞는 아파트 추천', points: ['출퇴근, 생활 패턴, 중요하게 보는 기준을 반영해요.', '조건이 바뀌면 추천도 함께 바뀌어요.'] },
        { img: 'images/about/undervalued.jpg', title: '저평가 아파트 안내', points: ['가격 대비 만족도가 높은 아파트를 찾아드려요.', '겉으로 드러나지 않는 가치를 함께 봐요.'] }
      ];
      return '<section class="about-hero"><div class="inner">' +
          '<div><h1>집 고르기, 실거주 데이터로 비교하면 쉬워집니다</h1>' +
          '<p>지도와 가격만으로는 알 수 없는 차이가 있어요. 비교파트는 실제로 살아본 사람들의 경험을 데이터로 정리해 나에게 맞는 단지를 찾도록 돕습니다.</p>' +
          '<div class="actions"><a class="btn btn-primary" href="#/apartments">아파트 둘러보기</a><a class="btn btn-ghost" href="#/tools">분석 도구 보기</a></div></div>' +
          '<img src="images/about/hero.jpg" alt="공원과 놀이터가 있는 아파트 단지">' +
        '</div></section>' +
        '<section class="why"><div class="inner"><h2>왜 비교파트인가요</h2><div class="why-grid">' + why.map(function (w) {
          return '<article class="why-card"><img src="' + w.img + '" alt="" loading="lazy"><div class="body"><h3>' + w.title + '</h3><ul>' +
            w.points.map(function (p) { return '<li>' + BP.icon('checkCircle', 'sm') + '<span>' + p + '</span></li>'; }).join('') + '</ul></div></article>';
        }).join('') + '</div></div></section>' +
        '<section class="team"><div class="inner"><h2>팀 소개</h2>' +
          '<div class="member"><img src="images/about/founder.jpg" alt="권현준 대표 사진"><div><h3>권현준</h3><p class="role">비교파트 Founder &amp; CEO</p>' +
          '<ul><li>경기수원외국인학교 산하 Key Club 수장</li><li>폴라리스 코리아 수장</li><li>경기수원외국인학교 산하 한국 경연 대회 수장</li></ul></div></div>' +
        '</div></section>';
    }
  });

  BP.page('reviews', {
    title: '한줄평 | 비교파트',
    render: function (ctx) {
      var areas = BP.areas().filter(function (ar) { return BP.inArea(ar).some(function (a) { return a.review; }); });
      var area = areas.indexOf(ctx.query.area) >= 0 ? ctx.query.area : '';
      var list = BP.apartments.filter(function (a) { return a.review && (!area || a.dong === area); });
      return '<div class="page">' + BP.backLink('#/tools') +
        '<div class="page-head"><div><h1>한줄평</h1><p>단지마다 꼭 알아야 할 장점과 아쉬운 점을 한 문장으로 정리했어요.</p></div></div>' +
        '<div class="chip-row filter-strip">' + [''].concat(areas).map(function (ar) {
          return '<a class="chip' + (ar === area ? ' is-on' : '') + '" href="#/reviews' + (ar ? '?area=' + encodeURIComponent(ar) : '') + '" style="text-decoration:none">' + (ar ? esc(ar) : '전체') + '</a>';
        }).join('') + '</div>' +
        '<div class="apt-grid">' + list.map(function (a) {
          return BP.aptCard(a, '<p class="review">' + esc(a.review) + '</p>');
        }).join('') + '</div></div>';
    }
  });
})();
