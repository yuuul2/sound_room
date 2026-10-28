# SOUND ROOM 음원 출처와 처리

2026-10-28에 아래 배포자의 파일별 공개 조건을 확인하고 테스트 버전에 연결했습니다. 코드 라이선스를 음원 라이선스로 대신하지 않았습니다. 원본 다운로드 URL·해시는 `audio/source-downloads.json`, 최종 앱 파일의 길이·피크·해시는 `audio/integrity.json`에 있습니다.

| 앱 소리 | 원 녹음·저작자 | 조건 | 배포 근거 |
|---|---|---|---|
| 비 | Soft rain on a tile roof — richwise, Freesound 466241 | CC0 1.0 | [Omarchy 음원별 크레딧](https://github.com/funcoder/omarchy-ambient/blob/2686c861bff26bc7da55dd8e4e858f6d66d39a41/CREDITS.md) |
| 바다 | Crashing Waves – Pacific Ocean — SecureSubset, Freesound 817075 | CC0 1.0 | 위 파일 |
| 바람 | Wind on bushes… — felix.blume, Freesound 711106 | CC0 1.0 | 위 파일 |
| 숲 | Forest quiet atmosphere with some birds — felix.blume, Freesound 414098 | CC0 1.0 | 위 파일 |
| 카페 | Restaurant Ambiance — stephan | Public Domain | [Blanket 음원별 라이선스](https://github.com/rafaelmardojai/blanket/blob/775f2a767230a9681850d1b1e085be58656f1382/SOUNDS_LICENSING.md), [원 출처](https://soundbible.com/1664-Restaurant-Ambiance.html) |
| 피아노 | Meta Piano의 실제 업라이트 피아노 Vel01 녹음 샘플 — Meta Creative Audio | CC0 1.0 | [공식 샘플 저장소](https://github.com/facebookincubator/Meta-open-sound/tree/251c0be57d5d1b3242b91f53e0cde62ab1cb42d9/systems/instruments/meta-piano), `audio/licenses/Meta-Piano-CC0.txt` |

CC0는 상업적 사용·변형·재배포를 허용합니다. 카페 파일은 배포자의 개별 음원 표에서 퍼블릭 도메인으로 명시되어 있습니다. 자연음·카페의 라이선스 근거는 해당 공개 배포 저장소의 기록이며, 원 Freesound/SoundBible 페이지를 이번 네트워크에서 직접 열어 재확인하지는 못했습니다. 배포 기록 사본을 `audio/licenses`에 보존했습니다. 음원 이외의 해당 프로젝트 코드·브랜드·이미지는 사용하지 않았습니다.

## 앱용 처리

- 자연음·카페: 48초 발췌, 2초 반복 경계 교차 혼합, DC 제거, 고정 음량 조절, 모노 MP3 128kbps.
- 피아노: 기록된 실제 피아노 샘플로 새로 구성한 48초/8마디의 느린 아르페지오. 기존 곡이나 이전 합성 QA 음원을 사용하지 않았습니다. 샘플 잔향은 반복 경계를 넘어 이어지도록 배치했습니다.
- 모든 출력은 48초이며 단일 파일 피크는 약 −14.3 dBFS 이하입니다. 재생 엔진에 추가 0.65 출력 이득을 적용해 동시 재생 여유를 확보했습니다.
- 재현 스크립트: `scripts/prepare-audio.py <original-source-directory>` (Python NumPy, FFmpeg 필요).

## 검증 범위

파일 디코딩·길이·피크 측정, 브라우저의 실제 오디오 출력 신호, 개별 음소거, 일시정지, 반복 설정, 타이머 페이드/종료를 검사합니다. 자동 검사는 사람의 청취 평가나 실제 휴대폰의 스피커·이어폰·블루투스·잠금 화면 검증을 대체하지 않습니다. 현재는 테스트용 선곡이며 최종 출시 청취 검수는 남아 있습니다.
