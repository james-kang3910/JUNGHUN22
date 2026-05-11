# SMI 최종 참고용 압축본 안내 (2026-05-11)

목적
- 이 파일 세트는 최종 참고용 전체 코드 압축본입니다.
- 기준 버전은 태그 smi-final-version-20260511 입니다.
- 최신 반영: 메인홈 이동 확인 팝업, 포인트/상점결제/회원전송 커스텀 확인 팝업 UI 개선

업로드된 분할 파일
- smi-final-reference-20260511.zip.part01
- smi-final-reference-20260511.zip.part02
- smi-final-reference-20260511.zip.part03
- smi-final-reference-20260511.zip.part04

왜 분할했는가
- 원본 압축 파일은 약 332MB로 GitHub 단일 파일 제한(100MB)을 초과합니다.
- 따라서 GitHub 업로드를 위해 95MB 단위 분할 파일로 저장했습니다.

복원 방법 (Windows PowerShell)
1) part 파일 4개를 같은 폴더에 둡니다.
2) 아래 순서대로 실행합니다.

- $out = [System.IO.File]::Create('smi-final-reference-20260511.zip')
- Get-Content .\smi-final-reference-20260511.zip.part01 -AsByteStream | ForEach-Object { $out.WriteByte($_) }
- Get-Content .\smi-final-reference-20260511.zip.part02 -AsByteStream | ForEach-Object { $out.WriteByte($_) }
- Get-Content .\smi-final-reference-20260511.zip.part03 -AsByteStream | ForEach-Object { $out.WriteByte($_) }
- Get-Content .\smi-final-reference-20260511.zip.part04 -AsByteStream | ForEach-Object { $out.WriteByte($_) }
- $out.Close()

3) 생성된 smi-final-reference-20260511.zip 파일을 압축 해제합니다.

주의사항
- 운영 배포 시 데이터베이스와 업로드 파일은 삭제하지 않습니다.
- 코드만 반영하고 운영 데이터는 유지합니다.

참고
- 브랜치: deploy-0415
- 태그: smi-final-version-20260511
- 커밋: 1ce1aa3
