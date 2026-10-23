/* Free and Pro plans. Free: a few scans a day, one file at a time, scores and top sources on screen.
   Pro: unlimited scans, batches, and the full reports to view and download. A license key is checked by
   /api/verify and checked again every week; the owner key unlocks Pro for good. */
(function (root) {
  "use strict";
  var VT = root.VT = root.VT || {};
  var C = root.FIO_CONFIG || {};
  var L = VT.license = {};
  var KEY = "fio-license", USE = "fio-usage", WEEK = 7 * 864e5;

  L.paid = !!C.paid;
  L.freeScans = C.freeScans == null ? 3 : C.freeScans;
  L.checkoutUrl = C.checkoutUrl || "";
  L.priceLabel = C.priceLabel || "";

  function read(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage off */ } }
  function today() { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }

  L.state = function () { var s = read(KEY); return s && s.expires > Date.now() ? s : null; };
  L.isPro = function () { return !L.paid || !!L.state(); };
  L.isOwner = function () { var s = L.state(); return !!(s && s.owner); };

  L.scansLeft = function () {
    if (L.isPro()) return Infinity;
    var u = read(USE);
    return Math.max(0, L.freeScans - (u && u.day === today() ? u.count : 0));
  };
  L.countScan = function () {
    if (L.isPro()) return;
    var u = read(USE);
    if (!u || u.day !== today()) u = { day: today(), count: 0 };
    u.count++;
    write(USE, u);
  };

  L.activate = async function (key) {
    var res, data = {};
    try {
      res = await fetch(C.verifyUrl || "/api/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: key }) });
      data = await res.json();
    } catch (e) {
      var off = new Error("The license could not be checked. Check your connection and try again.");
      off.offline = true;
      throw off;
    }
    if (!res.ok || !data.ok) {
      var bad = new Error(data.error || "This license key is not valid.");
      bad.invalid = res.status === 403;
      throw bad;
    }
    var s = { key: key, owner: !!data.owner, expires: Date.now() + WEEK };
    write(KEY, s);
    return s;
  };

  /* Re-checks a stored key when it has less than two days left; a revoked key is removed, and an
     offline check keeps the plan until it runs out. */
  L.refresh = async function () {
    var s = read(KEY);
    if (!L.paid || !s || s.expires - Date.now() > 2 * 864e5) return;
    try { await L.activate(s.key); } catch (e) { if (e.invalid) L.signOut(); }
  };

  L.signOut = function () { try { localStorage.removeItem(KEY); } catch (e) { /* storage off */ } };
})(typeof self !== "undefined" ? self : globalThis);
