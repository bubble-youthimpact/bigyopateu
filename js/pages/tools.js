/* 분석 도구 hub + shared tool list */
(function () {
  'use strict';
  BP.TOOLS = [
    { route: 'school', icon: 'school', title: '최적의 학군', desc: '학교까지의 거리와 대표 수학·영어 학원까지 걸리는 시간을 단지별로 비교해요.' },
    { route: 'value', icon: 'gem', title: '저평가 아파트', desc: '원하는 조건을 고르면 가격 대비 만족도가 높은 단지를 찾아드려요.' },
    { route: 'reviews', icon: 'message', title: '한줄평', desc: '단지마다 꼭 알아야 할 장단점을 한 문장으로 정리했어요.' },
    { route: 'commute', icon: 'clock', title: '출퇴근 스트레스', desc: '강남·여의도·광화문까지의 이동시간과 역까지 도보시간으로 출퇴근 부담을 계산해요.' },
    { route: 'rebuild', icon: 'hammer', title: '재건축 가능성', desc: '노후도, 용적률, 세대수, 입지, 시세와 내 연봉으로 재건축 가능성을 가늠해요.' },
    { route: 'safety', icon: 'shield', title: '안심거래센터', desc: '부동산 사기 유형, 계약 전 체크리스트, 피해 대응 절차와 1:1 상담 안내.' }
  ];

  BP.page('tools', {
    title: '분석 도구 | 비교파트',
    render: function () {
      return '<div class="page">' +
        '<div class="page-head"><div><h1>분석 도구</h1><p>집을 고를 때 궁금한 질문마다 하나씩 답해 주는 도구들이에요.</p></div></div>' +
        '<div class="tool-grid">' + BP.TOOLS.map(function (t) {
          return '<a class="tool-card" href="#/' + t.route + '"><span class="icon-tile">' + BP.icon(t.icon) + '</span><h3>' + t.title + '</h3><p>' + t.desc + '</p></a>';
        }).join('') + '</div></div>';
    }
  });

  BP.page('notfound', {
    title: '페이지를 찾을 수 없어요 | 비교파트',
    render: function () {
      return '<div class="page narrow"><div class="panel empty"><strong>페이지를 찾을 수 없어요</strong>주소가 바뀌었거나 삭제된 페이지예요.<br><br><a class="btn btn-primary" href="#/">지도로 돌아가기</a></div></div>';
    }
  });
})();
