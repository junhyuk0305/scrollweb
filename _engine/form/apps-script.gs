/**
 * 문의폼 수신 엔드포인트 — 구글시트 자동 적재 + 이메일 알림
 *
 * 백엔드·DB 없음. 고객 본인 구글 계정의 시트가 곧 DB이자 엑셀 다운로드 창구.
 * 셋업 절차는 같은 폴더의 README.md 참고. (고객별로 이 스크립트 1벌을 시트에 붙여넣고 배포)
 */

// ===== 고객별 설정 (이 3줄만 바꾸면 됨) =====
const NOTIFY_EMAIL = '';        // 알림 받을 이메일. 비우면 시트 소유자(본인) 메일로 발송
const SHEET_NAME   = '문의';     // 문의가 쌓일 시트 탭 이름
const SITE_NAME    = '웹사이트';  // 메일 제목/본문에 들어갈 업체·사이트명
// ==========================================

function doPost(e) {
  try {
    const data = parseBody_(e);

    // 허니팟: 사람 눈엔 안 보이는 숨은 필드. 봇이 채우면 조용히 무시(성공인 척 응답)
    if (data._gotcha) return json_({ ok: true });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['접수시각', '이름', '연락처', '이메일', '문의내용', '기타']);
    }

    const now     = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
    const name    = data.name    || '';
    const phone   = data.phone   || '';
    const email   = data.email   || '';
    const message = data.message || '';

    // 표준 칼럼 외 추가 필드(업종별 커스텀 항목)는 '기타'에 모아 적재
    const known = ['name', 'phone', 'email', 'message', '_gotcha'];
    const extra = Object.keys(data)
      .filter(k => known.indexOf(k) < 0)
      .map(k => k + ': ' + data[k])
      .join(' / ');

    sheet.appendRow([now, name, phone, email, message, extra]);
    notify_(now, name, phone, email, message, extra);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/** FormData(폼 전송) → e.parameter, JSON 전송 → postData.contents */
function parseBody_(e) {
  if (e && e.parameter && Object.keys(e.parameter).length) return e.parameter;
  if (e && e.postData && e.postData.contents) {
    try { return JSON.parse(e.postData.contents); } catch (_) {}
  }
  return {};
}

function notify_(now, name, phone, email, message, extra) {
  const to = NOTIFY_EMAIL || Session.getEffectiveUser().getEmail();
  if (!to) return;
  const body =
    '[' + SITE_NAME + '] 새 문의가 접수되었습니다.\n\n' +
    '접수시각: ' + now + '\n' +
    '이름: ' + name + '\n' +
    '연락처: ' + phone + '\n' +
    '이메일: ' + email + '\n\n' +
    '문의내용:\n' + message + '\n' +
    (extra ? '\n기타: ' + extra + '\n' : '');
  MailApp.sendEmail({
    to: to,
    subject: '[' + SITE_NAME + '] 새 문의 - ' + (name || '익명'),
    body: body
  });
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** 배포 확인용: 웹앱 URL을 브라우저로 열면 정상 작동 여부를 알려줌 */
function doGet() {
  return json_({ ok: true, msg: '문의폼 수신 엔드포인트 정상 작동' });
}
