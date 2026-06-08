/**
 * 재사용 문의폼 — Apps Script(구글시트+이메일) 엔드포인트로 전송.
 *
 * 사용법:
 *   <form data-inquiry data-endpoint="https://script.google.com/macros/s/.../exec"> ... </form>
 *   <script src=".../inquiry-form.js" defer></script>
 *
 * 고객별로 data-endpoint URL만 교체하면 됨. (셋업: README.md)
 *
 * 참고: Apps Script 웹앱은 교차 출처 응답에 CORS 헤더를 안 붙이므로 no-cors로 보낸다.
 *       → 응답 본문은 못 읽지만 시트 적재는 정상. 전송 성공은 낙관적으로 처리(문의폼엔 충분).
 */
(function () {
  'use strict';

  function init(form) {
    var endpoint = form.getAttribute('data-endpoint');
    var statusEl = form.querySelector('[data-form-status]');
    var button = form.querySelector('[type="submit"]');
    var btnText = button ? button.textContent : '';

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();

      // 엔드포인트 미설정 가드(배포 전 URL 교체 누락 방지)
      if (!endpoint || endpoint.indexOf('script.google.com') < 0) {
        setStatus(statusEl, '폼 엔드포인트가 설정되지 않았습니다. (data-endpoint 확인)', 'error');
        return;
      }

      // 필수 항목 검증
      var required = form.querySelectorAll('[required]');
      for (var i = 0; i < required.length; i++) {
        if (!required[i].value.trim()) {
          setStatus(statusEl, '필수 항목을 모두 입력해 주세요.', 'error');
          required[i].focus();
          return;
        }
      }

      var fd = new FormData(form);
      setBusy(button, true, '전송 중…');
      setStatus(statusEl, '', '');

      fetch(endpoint, { method: 'POST', body: fd, mode: 'no-cors' })
        .then(function () {
          setStatus(statusEl, '문의가 정상적으로 접수되었습니다. 빠르게 연락드리겠습니다.', 'success');
          form.reset();
        })
        .catch(function () {
          setStatus(statusEl, '전송에 실패했습니다. 잠시 후 다시 시도하시거나 전화로 문의해 주세요.', 'error');
        })
        .finally(function () {
          setBusy(button, false, btnText);
        });
    });
  }

  function setBusy(btn, busy, text) {
    if (!btn) return;
    btn.disabled = busy;
    btn.textContent = text;
  }

  function setStatus(el, msg, type) {
    if (!el) return;
    el.textContent = msg;
    el.setAttribute('data-state', type || '');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var forms = document.querySelectorAll('form[data-inquiry]');
    for (var i = 0; i < forms.length; i++) init(forms[i]);
  });
})();
