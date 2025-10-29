// public/js/show-map.js
(function () {
  var el = document.getElementById('map');
  if (!el) return;

  try {
    var geometry = el.dataset.geometry ? JSON.parse(el.dataset.geometry) : null;
    var token = el.dataset.token || '';
    var titleTxt = el.dataset.title || '';
    var locText = el.dataset.loc || '';

    if (!token || !geometry || !Array.isArray(geometry.coordinates)) {
      el.innerHTML = '<div style="padding:12px;border:1px solid #eee;border-radius:8px;background:#fff;">No map data for this listing yet.</div>';
      return;
    }

    mapboxgl.accessToken = token;
    var lng = geometry.coordinates[0];
    var lat = geometry.coordinates[1];

    var map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: 12
    });

    new mapboxgl.Marker()
      .setLngLat([lng, lat])
      .setPopup(new mapboxgl.Popup().setHTML('<strong>' + titleTxt + '</strong><br>' + locText))
      .addTo(map);

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
  } catch (e) {
    el.innerHTML = '<div style="padding:12px;border:1px solid #eee;border-radius:8px;background:#fff;">Map failed to load.</div>';
    console.warn('Map init error:', e);
  }
})();
