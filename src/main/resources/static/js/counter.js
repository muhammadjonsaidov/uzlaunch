(function () {
  var el = document.getElementById('sub-count');
  if (!el) return;
  var target = parseInt(el.getAttribute('data-count') || '0', 10);
  if (target === 0) return;
  var duration = Math.min(2000, Math.max(400, target * 20));
  var start = Date.now();
  function step() {
    var elapsed = Date.now() - start;
    var progress = Math.min(elapsed / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
})();
