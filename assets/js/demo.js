/* Demo reports for screenshots and marketing: a built-in sample essay with scores you choose, laid out
   like real reports and stamped "SAMPLE - NOT A REAL SCAN" on every page. Uploaded documents are never
   used, so a demo can not pass as a check of someone's work. */
(function (root) {
  "use strict";
  var VT = root.VT = root.VT || {};
  var D = VT.demo = {};

  D.WATERMARK = "SAMPLE - NOT A REAL SCAN";
  D.TEXT = [
    "SAMPLE ESSAY: PUBLIC TRANSPORT AND ACCESS",
    "Public transport shapes how people reach work, school, markets and health care. In many cities the routes that matter most are run by small operators whose schedules are not written down anywhere, which makes planning difficult for both riders and governments.",
    "Accessibility describes how easily people can reach the places they need. A simple way to measure it is to count how many destinations can be reached within a fixed travel time, such as thirty minutes, from a given starting point. The measure is easy to explain and does not require detailed surveys of personal preferences.",
    "Open data has changed what small research teams can do. Road networks from community maps, lists of schools and clinics from government registries, and published fare tables can be combined into a model of the transport system without a single field visit.",
    "Fairness matters as much as averages. A province can report good access overall while some towns remain far from hospitals and secondary schools. Inequality measures borrowed from economics, such as the Gini coefficient and the Theil index, show how access is shared between places.",
    "Hospital access deserves special attention. The nearest hospital is not always the right one, because capability, available beds and cost differ between facilities. A routing tool that considers these factors can save time when it matters most.",
    "Models built from open data still need checking. Assumptions about how often vehicles leave, how long transfers take and how fares are charged should be tested and stated clearly, so that readers know where the results are strong and where they are uncertain.",
    "Students and teachers can use projects like this to learn how numbers describe a place. The work combines geography, mathematics and computing, and the results can be shared with the communities that the routes serve.",
    "In the end, better information helps riders plan trips, helps planners spot gaps, and helps residents argue for services they need. Transport that is safe, affordable and easy to reach supports nearly every other goal a community sets for itself."
  ].join("\n\n");

  var SOURCES = [
    { type: "internet", title: "www.example-transport.org" },
    { type: "publication", title: "A Sample Study of Accessibility and Open Data" },
    { type: "submitted", title: "Submitted to Flip It Out on 2026-01-01" }
  ];

  /* Picks whole sentences, spread through the text, until about `pct` percent of the words are covered. */
  function pickSentences(doc, pct, offset) {
    var total = doc.wordCount, want = Math.round(total * pct / 100), got = 0, chosen = [];
    var order = doc.sentences.map(function (s, k) { return k; });
    order.sort(function (a, b) { return ((a * 7 + offset) % order.length) - ((b * 7 + offset) % order.length); });
    for (var i = 0; i < order.length && got < want; i++) {
      var s = doc.sentences[order[i]], n = 0;
      for (var j = s.start; j < s.end; j++) if (doc.words[j].isWord) n++;
      if (n < 5 || got + n > want + 12) continue;
      chosen.push(order[i]);
      got += n;
    }
    return chosen.sort(function (a, b) { return a - b; });
  }

  D.results = function (doc, simPct, aiPct) {
    var T = doc.wordCount;
    var simSents = pickSentences(doc, simPct, 1), share = [0, 0, 0], matches = [];
    simSents.forEach(function (k, i) {
      var s = doc.sentences[k], src = i % 3, n = 0;
      for (var j = s.start; j < s.end; j++) if (doc.words[j].isWord) n++;
      share[src] += n;
      matches.push({ source: src + 1, start: s.start, end: s.end, group: "ncq", words: n });
    });
    var pcts = share.map(function (n) { return 100 * n / T; });
    var sources = SOURCES.map(function (s, i) {
      return { n: i + 1, id: "demo:" + i, type: s.type, typeLabel: VT.sim.TYPES[s.type], title: s.title, url: "", words: share[i], pct: pcts[i] };
    }).filter(function (s) { return s.words > 0; });
    var used = pcts.reduce(function (a, b) { return a + b; }, 0);
    var sim = {
      totalWords: T, overall: used, types: { internet: pcts[0], publication: pcts[1], submitted: pcts[2] }, sources: sources, matches: matches,
      groups: VT.sim.GROUPS.map(function (g) { return { key: g.key, label: g.label, desc: g.desc, count: g.key === "ncq" ? matches.length : 0, pct: g.key === "ncq" ? used : 0 }; }),
      filtered: []
    };
    var aiSents = pickSentences(doc, aiPct, 4), segments = [], aiWords = 0;
    aiSents.forEach(function (k) {
      var s = doc.sentences[k], last = segments[segments.length - 1];
      for (var j = s.start; j < s.end; j++) if (doc.words[j].isWord) aiWords++;
      if (last && last.k === k - 1) { last.end = s.end; last.k = k; } else segments.push({ start: s.start, end: s.end, k: k });
    });
    var aiP = Math.round(100 * aiWords / T);
    var ai = { enough: true, qualifyingWords: T, aiWords: aiWords, percent: aiP, exact: aiP, hidden: aiP > 0 && aiP < 20, segments: segments };
    return { sim: sim, ai: ai };
  };
})(typeof self !== "undefined" ? self : globalThis);
