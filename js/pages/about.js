/* 소개 + 한줄평 */
(function () {
  'use strict';
  var esc = BP.esc;

  /* ---------- founder bio (Korean / English) ---------- */
  var PLAY_URL = 'https://play.google.com/store/apps/details?id=com.socialimpactventures.waroflegends';
  var FOUNDER = {
    ko: {
      name: '권현준', role: '경기수원외국인학교 12학년',
      interests: '학문적 관심 분야', topics: '경제학 · 행동경제학 · 주택시장',
      items: [
        '비교파트(<a href="https://bigyopateu.com">BigyoPateu.com</a>) 창립자·개발자',
        '주택시장·미디어 프레이밍 연구자 — MEDCOM 2026 국제학회 발표, <i>Journal of Applied Journalism &amp; Media Studies</i> 논문 peer review 진행 중',
        'War of Legends 수학 학습 전략 게임 기획·개발자<small>Android 앱 Google Play 출시 · <a href="' + PLAY_URL + '">Google Play에서 보기</a></small>',
        'Korea Business Competition(KBC) 마케팅 임원',
        '경기수원외국인학교 KBC Club 창립자·회장',
        'Polaris Korea Chapter 전 회장·현 명예회장',
        '경기수원외국인학교 Varsity Volleyball 주장'
      ]
    },
    en: {
      name: 'Kaiden Kwon', role: 'Grade 12, Gyeonggi Suwon International School',
      interests: 'Academic Interests', topics: 'Economics · Behavioral Economics · Housing Markets',
      items: [
        'Founder &amp; Developer, BigyoPateu (<a href="https://bigyopateu.com">BigyoPateu.com</a>)',
        'Researcher in Housing Markets &amp; Media Framing — Presented research at MEDCOM 2026; manuscript currently under peer review at the <i>Journal of Applied Journalism &amp; Media Studies</i>',
        'Creator &amp; Developer, War of Legends, math-learning strategy game<small>Android app published on Google Play · <a href="' + PLAY_URL + '">View on Google Play</a></small>',
        'Marketing Executive, Korea Business Competition (KBC)',
        'Founder &amp; President, GSIS Korea Business Competition (KBC) Club',
        'Former President &amp; Current Honorary President, Polaris Korea Chapter',
        'Captain, GSIS Varsity Volleyball'
      ]
    }
  };
  function founderBio(lang) {
    var f = FOUNDER[lang];
    return '<div class="bio" lang="' + lang + '"><h3>' + f.name + '</h3><p class="role">' + f.role + '</p>' +
      '<p class="interests"><span>' + f.interests + '</span>' + f.topics + '</p>' +
      '<ul>' + f.items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul></div>';
  }
  function founderCard() {
    return '<div class="member"><img src="images/about/founder.jpg" alt="권현준 (Kaiden Kwon) 사진"><div>' +
      '<div class="lang-seg" role="group" aria-label="언어 선택"><button type="button" data-bio="ko" class="is-on" aria-pressed="true">한국어</button><button type="button" data-bio="en" aria-pressed="false">English</button></div>' +
      '<div data-bio-body>' + founderBio('ko') + '</div></div></div>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-bio]');
    if (!b) return;
    var card = b.closest('.member');
    card.querySelectorAll('[data-bio]').forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on); });
    card.querySelector('[data-bio-body]').innerHTML = founderBio(b.getAttribute('data-bio'));
  });

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
        '<section class="team"><div class="inner"><h2>팀 소개</h2>' + founderCard() +
          '<p class="site-owner" style="margin-top:24px">비교파트는 <b>Youth Impact Studios</b>가 직접 개발·운영하는 서비스로, 웹사이트(bigyopateu.com)와 Android·iOS 앱을 함께 운영합니다. 문의: <a href="mailto:bubble.youthimpact@gmail.com">bubble.youthimpact@gmail.com</a></p>' +
          '<p class="site-owner">아파트 사진 출처: NAVER (네이버 지도·네이버 부동산). 사진의 저작권은 각 권리자에게 있습니다.</p>' +
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
