# SOUND ROOM

완성 시안과 사용자가 제공한 PNG 122개를 기준으로 새로 구현 중인 한국어·영어 Expo 앱입니다. 라이트·다크 테마를 지원합니다. **출시 완료본이 아닌 휴대폰 웹 테스트용 개발 버전**입니다.

## 현재 구현

- 시작·3단계 온보딩, 홈, 탐색·상세, 6개 사운드 믹서, 플레이어, 타이머·저장 시트, 보관함, 마이.
- 한국어·영어, 테마·프로필·기본 타이머·페이드아웃 설정의 기기 내 저장.
- 믹스 저장·수정·복제·삭제 확인, 즐겨찾기, 검색·빈 상태.
- 원본 PNG 바이트를 유지한 렌더링 단계의 개별 채도 보정. 보정값은 검토 중이며 시안과의 완전 일치를 의미하지 않습니다.
- CC0·퍼블릭 도메인 기반 실제 음원 6종과 재생 엔진. 개별 음량·반복·재생 위치·타이머·30초 페이드아웃.
- 모바일 Safari를 위한 Web Audio 재생과 독립 음량 조절, 오디오 시계 기반 타이머 예약.

## 아직 필요한 것

- 음원 6종을 연결했습니다. 최종 청취 검수와 실제 기기의 스피커·이어폰·블루투스 확인은 남아 있습니다. 출처와 처리 내역은 `rebuild/AUDIO_SOURCES.md` 참조.
- 실제 Android/iPhone에서 SVG 이미지 필터·메모리·오디오·화면·안전 영역 검증. 네이티브 번들 생성은 APK/IPA 생성이나 실기기 검증이 아닙니다.
- 에셋별 색감과 시안의 세부 간격 최종 검수. 일부 제공된 PNG 선 아이콘에는 원본의 가장자리 흔적이 있습니다.
- 시스템 알림, 출시용 문의 주소, 백그라운드 재생, 스토어 등록·개인정보처리방침·앱 아이콘·서명. 현재 알림/문의는 미연결 안내를 표시합니다. 타이머의 백그라운드 종료도 미검증입니다.

## 휴대폰 링크 테스트 준비

Android Chrome과 iPhone Safari에서 열 수 있는 정적 웹 테스트판을 만들었습니다. 네이티브 설치 파일이나 스토어 배포본과는 구분합니다. 배포 대상은 `https://yuuul2.github.io/sound_room/`이며, GitHub Pages 배포 성공 확인 전에는 작동하는 링크로 안내하지 않습니다.

GitHub Pages가 처음이라면 저장소 관리자가 Settings → Pages → Build and deployment → Source를 **Deploy from a branch**로, Branch를 **gh-pages / (root)**로 선택하고 Save를 누릅니다. 이미 빌드한 테스트 웹사이트가 gh-pages 브랜치에 준비됩니다. 다음 버전은 작업자가 해당 브랜치를 갱신합니다. 사이트 활성화 여부는 별도 검증해야 합니다.

## Expo Go를 사용하는 선택적 로컬 테스트

Expo 계정 없이 같은 Wi-Fi에서 Expo Go로 개발 화면을 확인하는 경로입니다. 이 작업 환경의 localhost 주소는 휴대폰에서 열리지 않습니다.

1. 이 저장소를 개인 컴퓨터에 내려받습니다. Node.js 24 LTS와 휴대폰의 Expo Go를 설치합니다.
2. Windows: `Start-SOUND-ROOM.cmd` 실행. macOS/Linux: 터미널에서 `bash Start-SOUND-ROOM.sh` 실행.
3. 컴퓨터와 휴대폰을 같은 Wi-Fi에 연결합니다. Android는 Expo Go에서, iPhone은 카메라에서 터미널 QR을 읽습니다.
4. 앱이 요구하는 Expo SDK 58과 설치한 Expo Go의 지원 버전이 일치해야 합니다. 불일치하면 개발 빌드가 필요합니다. 아직 실제 기기 연결을 확인하지 않았습니다.
5. 처음에는 온보딩이 나옵니다. 마이 → 언어/배경 테마에서 전환합니다. 믹서 → 플레이어 → 저장 → 보관함 순으로 확인할 수 있습니다.

로컬 명령:

```bash
npm ci
npm run start:lan
```

첫 다운로드는 약 109MB의 원본 PNG를 포함합니다. 앱을 검토하는 동안 컴퓨터의 개발 서버를 켜둡니다. 실제 6종 음원이 포함됩니다.

## 개발 검증

```bash
npm run typecheck
npm run web
# 다른 터미널: Chromium 설치 경로를 CHROMIUM_PATH로 지정 가능
npm test
npm run export:native
```

`npm test`는 새 구현 전용 Playwright 흐름 8개 (실제 오디오 출력·음소거·1분 페이드아웃/종료 포함)를 검사합니다. 이전 폐기 버전의 코드·음원·테스트는 체크아웃 밖에 보존했고 실행 경로에 포함하지 않습니다.

실제 앱 진입점은 `App.tsx` → `rebuild/src/CorePreview.tsx`입니다. 원본 PNG는 `rebuild/assets`, 해시는 `rebuild/asset-integrity.json`, 검토 스크린샷은 `rebuild/review/screenshots`에 있습니다. 스크린샷은 개발 브라우저 캡처이며 확정 시안이나 물리 기기 캡처가 아닙니다.
