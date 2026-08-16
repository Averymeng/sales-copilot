/* 觅客精灵 · 预览交互（HTML 原型动态） */
(function () {
  // —— Toast ——
  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<span class="ok">✓</span>' + msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('show'); });
    setTimeout(function () { t.classList.remove('show'); setTimeout(function(){ t.remove(); }, 300); }, 2200);
  }
  window.toast = toast;

  // —— 侧边栏高亮（画廊跳转用） ——
  var path = location.pathname.split('/').pop();
  document.querySelectorAll('.nav a').forEach(function (a) {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });

  // —— AI 对话浮窗 ——
  var fab = document.querySelector('.fab');
  var chat = document.querySelector('.chat');
  if (fab && chat) {
    var close = chat.querySelector('.x');
    fab.addEventListener('click', function () { chat.classList.add('open'); chat.querySelector('input').focus(); });
    close && close.addEventListener('click', function () { chat.classList.remove('open'); });
    chat.querySelectorAll('.chip').forEach(function (c) {
      c.addEventListener('click', function () { send(c.textContent); });
    });
    var input = chat.querySelector('input');
    var btn = chat.querySelector('.foot button');
    function send(text) {
      text = (text || input.value || '').trim();
      if (!text) return;
      var body = chat.querySelector('.body');
      var me = document.createElement('div'); me.className = 'msg me'; me.textContent = text;
      body.appendChild(me); input.value = ''; body.scrollTop = body.scrollHeight;
      var ai = document.createElement('div'); ai.className = 'msg ai';
      ai.innerHTML = '<div class="who">觅客精灵 · 副驾</div><div class="typing"><i></i><i></i><i></i></div>';
      body.appendChild(ai); body.scrollTop = body.scrollHeight;
      var replies = [
        '已为你查询：当前「考研冲刺」赛道近 7 天消耗环比 +12.4%，但留资成本升至 ¥96（赛道均值 ¥90），主要因为信息流按钮点击率下滑。建议把 15% 预算从信息流挪到搜索版位。',
        '根据行业基准，考公考编赛道 CPL 最低（约 ¥65），你手上的「公考王」账户 CPL ¥71 已优于大盘。可优先向其增预算。',
        '已生成《XX 机构 Q4 种草方案》，包含人群策略、内容策略、投放策略（含搜索词清单）与报价，已导出 Word / PPT。',
        '今日需重点关注的 3 件事已列出：①「华图公考」掉量预警待排查 ②「新航道」方案待发送 ③「中公」周复盘待产出。'
      ];
      setTimeout(function () {
        ai.innerHTML = '<div class="who">觅客精灵 · 副驾</div>' + replies[Math.floor(Math.random()*replies.length)];
        body.scrollTop = body.scrollHeight;
      }, 900 + Math.random() * 700);
    }
    btn && btn.addEventListener('click', function(){ send(); });
    input && input.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });
  }

  // —— 生成态（提案 / 复盘 / 空态首提案） ——
  function genHandler() {
    var b = this;
    var target = document.querySelector(b.getAttribute('data-generate'));
    toast('AI 正在生成，请稍候…');
    if (target) {
      target.style.display = '';
      target.querySelectorAll('[data-shimmer]').forEach(function (el) {
        el.classList.add('shimmer'); el.textContent = '生成中…';
      });
      setTimeout(function () {
        target.querySelectorAll('[data-shimmer]').forEach(function (el) {
          el.classList.remove('shimmer');
          el.textContent = el.getAttribute('data-done') || '已生成 ✓';
        });
        target.classList.add('ready');
        toast('已生成 ✓ 可导出 Word / PPT');
      }, 1600);
    }
  }
  function convertHandler() {
    var b = this;
    b.textContent = '已转入客户档案'; b.disabled = true; b.classList.add('btn-soft'); b.classList.remove('btn-primary');
    toast('线索已转入客户档案');
  }
  // 动态绑定（含抽屉内新注入的 DOM）
  function bindDynamic(scope) {
    scope.querySelectorAll('[data-generate]').forEach(function (b) { if (b._b) return; b._b = 1; b.addEventListener('click', genHandler); });
    scope.querySelectorAll('[data-convert]').forEach(function (b) { if (b._c) return; b._c = 1; b.addEventListener('click', convertHandler); });
  }
  bindDynamic(document);

  // —— 悬浮抽屉（查看详情，不跳转页面） ——
  var drawer = document.querySelector('.drawer-root');
  if (drawer) {
    var dbody = drawer.querySelector('.dbody');
    var dtt = drawer.querySelector('.dtt');
    document.addEventListener('click', function (e) {
      var op = e.target.closest('[data-drawer-target]');
      if (op) {
        var sel = op.getAttribute('data-drawer-target');
        var tpl = document.querySelector(sel);
        if (tpl) {
          dbody.innerHTML = tpl.innerHTML;
          dtt.textContent = op.getAttribute('data-drawer-title') || tpl.getAttribute('data-title') || '详情';
          drawer.classList.add('open');
          dbody.scrollTop = 0;
          bindDynamic(dbody);
        }
        return;
      }
      if (e.target.closest('[data-drawer-close]')) {
        drawer.classList.remove('open');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') drawer.classList.remove('open');
    });
  }

  // —— 客户筛选（档案 / 投放页：未筛选→氛围留白，选中→内联渲染） ——
  function renderClientFilter(sel) {
    var tplId = sel.value;
    var target = document.querySelector(sel.getAttribute('data-target'));
    var empty = document.querySelector(sel.getAttribute('data-empty'));
    if (!tplId) {
      if (target) { target.innerHTML = ''; target.style.display = 'none'; }
      if (empty) empty.style.display = '';
      return;
    }
    var tpl = document.querySelector(tplId);
    if (tpl && target) {
      target.innerHTML = tpl.innerHTML;
      target.style.display = '';
      if (empty) empty.style.display = 'none';
      bindDynamic(target);
      if (target.scrollIntoView) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  document.querySelectorAll('[data-client-filter]').forEach(function (sel) {
    sel.addEventListener('change', function () { renderClientFilter(sel); });
  });

  // —— 一键转档案（页面级，非抽屉） ——
  document.querySelectorAll('[data-convert]').forEach(function (b) {
    if (b._c) return; b._c = 1;
    b.addEventListener('click', convertHandler);
  });

  // —— 分段 Tab ——
  document.querySelectorAll('.seg').forEach(function (seg) {
    seg.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        seg.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); });
        btn.classList.add('on');
        var panel = btn.getAttribute('data-panel');
        var grp = seg.closest('[data-tabs]');
        if (grp) grp.querySelectorAll('[data-tab]').forEach(function (p) {
          p.style.display = (p.getAttribute('data-tab') === panel) ? '' : 'none';
        });
      });
    });
  });

  // —— 折叠（今日3件事） ——
  document.querySelectorAll('[data-toggle]').forEach(function (el) {
    el.addEventListener('click', function () {
      var t = document.querySelector(el.getAttribute('data-toggle'));
      if (t) t.style.display = (t.style.display === 'none') ? '' : 'none';
    });
  });
})();
