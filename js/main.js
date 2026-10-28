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
      el.textContent = Math.round(target * eased);
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

  /* ---------- 页脚年份 ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
