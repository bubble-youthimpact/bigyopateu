/*
 * 비교파트 settings — the only file you normally need to edit.
 */
window.BIGYO_CONFIG = {
  // Public address of the GitHub Pages site (with trailing slash).
  // The iOS / Android app loads the Naver map from here, because Naver only
  // accepts map requests from domains you registered in the NAVER Cloud console.
  // e.g. "https://yourname.github.io/bigyopateu/"  or  "https://bigyopateu.com/"
  siteUrl: "https://bigyopateu.com/",

  // NAVER Cloud Platform → AI·NAVER API → Maps → Application → "Client ID"
  // Register these Web service URLs for that key:
  //   https://yourname.github.io   (and your custom domain if you use one)
  //   http://localhost:8080        (for testing on your computer)
  naverMapClientId: "pqlijzerxw",
  // Newer NAVER Maps keys use "ncpKeyId". Older keys used "ncpClientId".
  naverMapKeyParam: "ncpKeyId",

  // Where 안심거래센터 consultation requests and privacy questions are sent.
  contactEmail: "bubble.youthimpact@gmail.com",

  // Who runs the website and the apps (shown in the footer, 소개 and the privacy policy)
  operator: "Youth Impact Studios",

  // 1:1 상담 form is delivered by FormSubmit (https://formsubmit.co) to this inbox.
  // The very first request sends an activation email here — click "Activate Form" once.
  // After activating, FormSubmit gives you a random string; you can paste it here
  // instead of the address so the email isn't visible in the site's code.
  formSubmitEmail: "bubble.youthimpact@gmail.com",

  // 1:1 상담 partner lawyer (shown on 안심거래센터)
  lawyer: {
    name: "차형진",
    firm: "법무법인 온전",
    phone: "010-9049-1537",
    photo: "images/lawyer.jpg"
  }
};
