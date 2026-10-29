/* 관심 단지: apartments the user saved on this device */
(function () {
  'use strict';
  BP.page('saved', {
    title: '관심 단지 | 비교파트',
    render: function () {
      var list = BP.saved.list().map(BP.get).filter(Boolean);
      var head = '<div class="page-head"><div><h1>관심 단지</h1><p>' +
        (list.length ? '저장한 ' + list.length + '개 단지예요. 이 기기에만 저장돼요.' : '마음에 드는 단지를 하트로 저장해 두고 한곳에서 다시 보세요.') + '</p></div>' +
        (list.length > 1 ? '<a class="btn btn-primary" href="#/compare?ids=' + list.slice(0, 4).map(function (a) { return encodeURIComponent(a.id); }).join(',') + '">' + BP.icon('compare', 'sm') + '저장한 단지 비교하기</a>' : '') +
        '</div>';
      if (!list.length) {
        return '<div class="page">' + head +
          '<section class="panel saved-empty">' + BP.icon('heart') +
            '<p><strong>아직 저장한 단지가 없어요</strong></p>' +
            '<p class="hint">단지 사진의 하트 버튼을 누르면 여기에 모여요.</p>' +
            '<a class="btn btn-primary" href="#/apartments">아파트 둘러보기</a>' +
          '</section></div>';
      }
      return '<div class="page">' + head + '<div class="apt-grid">' + list.map(function (a) { return BP.aptCard(a); }).join('') + '</div></div>';
    }
  });
})();
