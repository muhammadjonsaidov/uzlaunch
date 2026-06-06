(function () {
  var container = document.getElementById('countdown-container');
  if (!container) return;
  var launchStr = container.getAttribute('data-launch');
  if (!launchStr) return;

  var launch = new Date(launchStr.includes('T') ? launchStr : launchStr + 'T00:00:00');

  function pad(n) { return String(n).padStart(2, '0'); }

  function showLaunched() {
    var live = document.getElementById('cd-live');
    var launched = document.getElementById('cd-launched');
    if (live) live.style.display = 'none';
    if (launched) launched.style.display = 'block';
  }

  function update() {
    var diff = launch - new Date();
    if (diff <= 0) { showLaunched(); return; }
    document.getElementById('cd-days').textContent  = pad(Math.floor(diff / 86400000));
    document.getElementById('cd-hours').textContent = pad(Math.floor((diff % 86400000) / 3600000));
    document.getElementById('cd-mins').textContent  = pad(Math.floor((diff % 3600000) / 60000));
    document.getElementById('cd-secs').textContent  = pad(Math.floor((diff % 60000) / 1000));
    setTimeout(update, 1000);
  }

  if (launch <= new Date()) { showLaunched(); return; }
  update();
})();
