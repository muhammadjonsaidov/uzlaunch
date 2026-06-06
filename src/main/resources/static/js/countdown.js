(function () {
  var container = document.getElementById('countdown-container');
  if (!container) return;
  var launchStr = container.getAttribute('data-launch');
  if (!launchStr) return;

  var launch = new Date(launchStr.includes('T') ? launchStr : launchStr + 'T00:00:00');

  function pad(n) { return String(n).padStart(2, '0'); }

  function update() {
    var now = new Date();
    var diff = launch - now;
    if (diff <= 0) { container.style.display = 'none'; return; }
    var days  = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var mins  = Math.floor((diff % 3600000) / 60000);
    var secs  = Math.floor((diff % 60000) / 1000);
    document.getElementById('cd-days').textContent  = pad(days);
    document.getElementById('cd-hours').textContent = pad(hours);
    document.getElementById('cd-mins').textContent  = pad(mins);
    document.getElementById('cd-secs').textContent  = pad(secs);
  }

  update();
  setInterval(update, 1000);
})();
