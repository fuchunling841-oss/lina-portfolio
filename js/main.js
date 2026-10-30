/* ============================================================
   Lina Portfolio — 交互脚本
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 滚动进度条 ---------- */
  var progress = document.getElementById("progress");
  function updateProgress() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  /* ---------- 移动端菜单 ---------- */
  var burger = document.getElementById("burger");
  var mobileMenu = document.getElementById("mobileMenu");
  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("open");
      burger.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
      burger.querySelectorAll("span")[0].style.transform = open ? "translateY(6.5px) rotate(45deg)" : "";
      burger.querySelectorAll("span")[1].style.opacity = open ? "0" : "";
      burger.querySelectorAll("span")[2].style.transform = open ? "translateY(-6.5px) rotate(-45deg)" : "";
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobileMenu.classList.remove("open");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- 滚动入场 ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- 数字滚动 ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dur = 1300;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = target >= 1000 ? val.toLocaleString("en-US") : val;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          animateCount(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
  }

  /* ---------- 能力条 ---------- */
  var bars = document.querySelectorAll(".bar i[data-w]");
  if ("IntersectionObserver" in window) {
    var bio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.style.width = e.target.getAttribute("data-w") + "%";
          bio.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    bars.forEach(function (el) { bio.observe(el); });
  } else {
    bars.forEach(function (el) { el.style.width = el.getAttribute("data-w") + "%"; });
  }

  /* ---------- 光标氛围光（仅精确指针） ---------- */
  var glow = document.getElementById("glow");
  if (glow && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("mousemove", function (e) {
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
    }, { passive: true });
  } else if (glow) {
    glow.style.display = "none";
  }

  /* ---------- 作品页：筛选 + 排序 ---------- */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var sortSelect = document.getElementById("sortSelect");
  var workCards = Array.prototype.slice.call(document.querySelectorAll(".work-card"));
  var countNote = document.getElementById("countNote");
  var emptyTip = document.getElementById("emptyTip");
  var grid = document.getElementById("worksGrid");

  function currentFilter() {
    var active = document.querySelector(".filter-btn.active");
    return active ? active.getAttribute("data-cat") : "all";
  }

  function applyWorks() {
    var cat = currentFilter();
    var sort = sortSelect ? sortSelect.value : "featured";

    var visible = workCards.filter(function (c) {
      return cat === "all" || c.getAttribute("data-cat") === cat;
    });

    // 排序：featured 保持 DOM 顺序；date 用 data-date 降序；name 用拼音/字符串
    if (sort === "date") {
      visible.sort(function (a, b) {
        return (b.getAttribute("data-date") || "").localeCompare(a.getAttribute("data-date") || "");
      });
    } else if (sort === "name") {
      visible.sort(function (a, b) {
        return (a.getAttribute("data-name") || "").localeCompare(b.getAttribute("data-name") || "", "zh-Hans-CN");
      });
    }

    // 重排 DOM（隐藏的放后面）
    var hidden = workCards.filter(function (c) { return visible.indexOf(c) === -1; });
    if (grid) {
      visible.forEach(function (c) { grid.appendChild(c); });
      hidden.forEach(function (c) { grid.appendChild(c); });
    }

    workCards.forEach(function (c) {
      var show = visible.indexOf(c) !== -1;
      c.classList.toggle("hide", !show);
      if (show) {
        c.style.animation = "none";
        void c.offsetWidth; // 重启动画
        c.style.animation = "";
      }
    });

    if (countNote) {
      countNote.textContent = "共 " + visible.length + " 件作品" + (cat === "all" ? "" : " · " + cat);
    }
    if (emptyTip) emptyTip.classList.toggle("show", visible.length === 0);
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      applyWorks();
    });
  });
  if (sortSelect) sortSelect.addEventListener("change", applyWorks);
  if (workCards.length) applyWorks();

  /* ---------- 文档封面放大查看 ---------- */
  var zoomables = document.querySelectorAll(".doc-strip img, [data-zoom]");
  if (zoomables.length) {
    var lb = document.createElement("div");
    lb.className = "lightbox";
    var lbImg = document.createElement("img");
    var lbHint = document.createElement("div");
    lbHint.className = "lb-hint";
    lbHint.textContent = "点击任意处或按 Esc 关闭";
    lb.appendChild(lbImg);
    lb.appendChild(lbHint);
    document.body.appendChild(lb);

    function closeLb() {
      lb.classList.remove("open");
      document.body.style.overflow = "";
    }
    zoomables.forEach(function (img) {
      img.addEventListener("click", function () {
        lbImg.src = img.getAttribute("src");
        lbImg.alt = img.alt || "";
        lb.classList.add("open");
        document.body.style.overflow = "hidden";
      });
    });
    lb.addEventListener("click", closeLb);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lb.classList.contains("open")) closeLb();
    });
  }

  /* ---------- 作品集：精选影片播放 ---------- */
  var filmPlayers = Array.prototype.slice.call(document.querySelectorAll("[data-film]"));
  var filmVideos = [];

  function pickFilmSource(video) {
    var hd = video.getAttribute("data-src-hd");
    var uhd = video.getAttribute("data-src-uhd");
    if (!uhd) return hd;
    var small = window.matchMedia("(max-width: 860px)").matches;
    var conn = navigator.connection || {};
    var light = conn.saveData || /2g/.test(conn.effectiveType || "");
    // 手机上给 1080p，宽屏 + 高分屏才拉 4K 母版；只在点击时加载，不拖慢首屏
    if (small || light || window.devicePixelRatio < 1.5) return hd;
    return uhd;
  }

  filmPlayers.forEach(function (player) {
    var video = player.querySelector("[data-film-video]");
    var btn = player.querySelector("[data-film-play]");
    if (!video || !btn) return;
    filmVideos.push(video);

    btn.addEventListener("click", function () {
      if (!video.getAttribute("src")) {
        video.setAttribute("src", pickFilmSource(video));
      }
      // 一支开播，其他先停下
      filmVideos.forEach(function (v) {
        if (v !== video && !v.paused) v.pause();
      });
      video.setAttribute("controls", "");
      var played = video.play();
      if (played && played.catch) {
        played.catch(function () { player.classList.remove("is-playing"); });
      }
    });

    video.addEventListener("play", function () {
      player.classList.add("is-playing");
    });
    video.addEventListener("ended", function () {
      player.classList.remove("is-playing");
      video.currentTime = 0;
    });
  });

  /* ---------- 求职岗位：读取配置 + 就地编辑 ---------- */
  var CFG = window.SITE_CONFIG || {};
  var DEFAULT_ROLES = (CFG.roles && CFG.roles.length) ? CFG.roles.slice() : ["品牌与内容运营", "内容营销"];
  var CITY = CFG.city || "深圳";
  var STATUS = CFG.status || "OPEN TO WORK";
  var STORE_KEY = "lina.career.roles";
  var roles = DEFAULT_ROLES.slice();

  function readStored() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      var arr = JSON.parse(raw);
      if (!arr || !arr.length) return null;
      return arr;
    } catch (e) { return null; }
  }
  var stored = readStored();
  if (stored) roles = stored;

  function applyRoles() {
    var full = roles.join(" / ");
    document.querySelectorAll('[data-career="role"]').forEach(function (el) {
      el.textContent = roles[0];
    });
    document.querySelectorAll('[data-career="tag"]').forEach(function (el) {
      el.textContent = STATUS + " · " + CITY + " · " + full;
    });
  }
  applyRoles();

  var editor = null, editorInput = null, isOpen = false;

  function buildEditor() {
    var box = document.createElement("div");
    box.className = "career-editor";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", "编辑求职岗位");
    box.innerHTML =
      '<div class="ce-head">' +
        '<span class="ce-label">求职岗位 · 编辑</span>' +
        '<button class="ce-x" type="button" data-ce="close" aria-label="关闭">×</button>' +
      '</div>' +
      '<input class="ce-input" type="text" spellcheck="false" autocomplete="off" ' +
        'placeholder="品牌与内容运营 / 内容营销">' +
      '<p class="ce-hint">用 <b>/</b> 分隔多个岗位，导航只取第一个。点「保存」本机所有页面同步。</p>' +
      '<div class="ce-actions">' +
        '<button class="ce-btn primary" type="button" data-ce="save">保存</button>' +
        '<button class="ce-btn" type="button" data-ce="copy">复制配置</button>' +
        '<button class="ce-btn" type="button" data-ce="reset">恢复默认</button>' +
      '</div>' +
      '<p class="ce-note">只存在这台电脑的浏览器里。要让访客也看到，把复制出来的这行粘进 <code>js/site-config.js</code> 的 <code>roles</code>。</p>';
    document.body.appendChild(box);

    editorInput = box.querySelector(".ce-input");
    editorInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); commit(); }
      if (e.key === "Escape") { e.preventDefault(); closeEditor(); }
    });
    box.addEventListener("click", function (e) {
      var act = e.target.closest("[data-ce]");
      if (!act) return;
      var kind = act.getAttribute("data-ce");
      if (kind === "save") commit();
      if (kind === "close") closeEditor();
      if (kind === "reset") {
        try { window.localStorage.removeItem(STORE_KEY); } catch (err) {}
        roles = DEFAULT_ROLES.slice();
        applyRoles();
        fillInput();
        flash(act, "已恢复");
      }
      if (kind === "copy") {
        var line = 'roles: ' + JSON.stringify(roles);
        var done = function () { flash(act, "已复制"); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(line).then(done, done);
        } else {
          var ta = document.createElement("textarea");
          ta.value = line; document.body.appendChild(ta); ta.select();
          try { document.execCommand("copy"); } catch (err) {}
          document.body.removeChild(ta); done();
        }
      }
    });
    return box;
  }

  function fillInput() {
    if (editorInput) editorInput.value = roles.join(" / ");
  }

  function flash(btn, text) {
    var old = btn.textContent;
    btn.textContent = text;
    setTimeout(function () { btn.textContent = old; }, 1600);
  }

  function commit() {
    var parts = editorInput.value.split(/[\/、,，;；|]+/).map(function (s) {
      return s.trim();
    }).filter(Boolean);
    if (!parts.length) {
      editorInput.focus();
      editorInput.classList.add("is-error");
      setTimeout(function () { editorInput.classList.remove("is-error"); }, 900);
      return;
    }
    roles = parts.slice(0, 3);
    try {
      if (roles.join("|") === DEFAULT_ROLES.join("|")) {
        window.localStorage.removeItem(STORE_KEY);
      } else {
        window.localStorage.setItem(STORE_KEY, JSON.stringify(roles));
      }
    } catch (err) {}
    applyRoles();
    fillInput();
    var saveBtn = editor.querySelector('[data-ce="save"]');
    if (saveBtn) flash(saveBtn, "已保存");
  }

  function openEditor() {
    if (!editor) { editor = buildEditor(); fillInput(); }
    isOpen = true;
    editor.classList.add("open");
    document.body.classList.add("editing");
    fillInput();
    setTimeout(function () { editorInput.focus(); editorInput.select(); }, 120);
  }

  function closeEditor() {
    if (!editor) return;
    isOpen = false;
    editor.classList.remove("open");
    document.body.classList.remove("editing");
  }

  // 编辑模式下点首页那行岗位标签，直接打开面板（普通访客点它不会弹）
  document.querySelectorAll("[data-career-block]").forEach(function (el) {
    el.addEventListener("click", function () {
      if (document.body.classList.contains("editing")) openEditor();
    });
  });

  // 入口：地址栏 ?edit=1，或按 Shift + E
  if (/[?&]edit=1/.test(window.location.search)) openEditor();
  document.addEventListener("keydown", function (e) {
    if (e.shiftKey && (e.key === "E" || e.key === "e") &&
        !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
      e.preventDefault();
      if (isOpen) { closeEditor(); } else { openEditor(); }
    }
    if (e.key === "Escape" && isOpen) closeEditor();
  });

  /* ---------- 页脚年份 ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
