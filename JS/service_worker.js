const sCacheName ="practice-pwa";//캐시 이름 선언
const aFilesToCache = ['./','./index.html','./manifest.json','./icon-main.png'];//캐시할 파일 선언

//서비스워커 설치하고 캐시파일 저장
self.addEventListener('install', pEvent => {
    console.log('서비스워커를 설치합니다.');
    pEvent.waitUntil(
        caches.open(sCacheName)
        .then(pCache => {
          console.log('파일을 캐시에 저장합니다.');
          return pCache.addAll(aFilesToCache);
        })
      );
});
// 고유번호 할당받은 서비스 워커 동작 시작
self.addEventListener('activate', pEvent => {
    console.log('서비스워커 동작 시작');
});


//데이터 요청시 네트워크 또는 캐시에서 찾아 반환 
self.addEventListener('fetch', pEvent => {
    pEvent.respondWith(
      caches.match(pEvent.request)
      .then(response => {
        if (!response) {
          console.log("네트워크에서 데이터 요청!", pEvent.request)
          return fetch(pEvent.request);
        }
        console.log("캐시에서 데이터 요청!", pEvent.request)
        return response;
      }).catch(err => console.log(err))
    );
  });