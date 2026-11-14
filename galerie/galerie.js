/* Lädt die Liste der Galerie-Bilder aus dem Ordner galerie/bilder im GitHub-Repository.
   Neue Bilder einfach in diesen Ordner hochladen, der Dateiname ist die Bildunterschrift. */
(function () {
  var REPO = 'notExpectet/Bodensee-Pinguine-Web', DIR = 'galerie/bilder', BRANCH = 'main';
  // Wird benutzt, falls GitHub nicht erreichbar ist (z.B. API-Limit erreicht)
  var FALLBACK = ['1. Platz in Weil der Stadt.webp', 'Unser Team am Spielfeld.jpg'];
  var EXT = /\.(jpe?g|png|webp|avif|gif)$/i;
  var CACHE = 'bopi-galerie-v1';

  function toItem(name) {
    return {
      name: name,
      src: '/' + DIR + '/' + encodeURIComponent(name),
      caption: name.replace(EXT, '').replace(/^\d+_/, '').replace(/_/g, ' ').trim()
    };
  }

  var promise = null;
  window.loadGallery = function () {
    if (promise) return promise;
    var cached = null;
    try { cached = JSON.parse(sessionStorage.getItem(CACHE) || 'null'); } catch (e) {}
    var names = cached ? Promise.resolve(cached) :
      fetch('https://api.github.com/repos/' + REPO + '/contents/' + DIR + '?ref=' + BRANCH, { headers: { Accept: 'application/vnd.github+json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (list) {
          var n = list.filter(function (f) { return f.type === 'file' && EXT.test(f.name); }).map(function (f) { return f.name; });
          try { sessionStorage.setItem(CACHE, JSON.stringify(n)); } catch (e) {}
          return n;
        })
        .catch(function () { return FALLBACK; });
    promise = names.then(function (n) {
      return n.slice().sort(function (a, b) { return a.localeCompare(b, 'de', { numeric: true }); }).map(toItem);
    });
    return promise;
  };
})();
