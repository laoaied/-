/* =============================================================
   🎂 生日快乐 - 交互脚本
   流程：5 次烟花 → 蛋糕 → 许愿 → 吹蜡烛 → 大爆发
   ============================================================= */

/* ---------- 星空生成 ---------- */
function createStars(n = 100) {
  const layer = document.getElementById('stars');
  for (let i = 0; i < n; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.setProperty('--dur', (2 + Math.random() * 4) + 's');
    s.style.setProperty('--delay', Math.random() * 5 + 's');
    s.style.width = s.style.height = (1 + Math.random() * 2) + 'px';
    layer.appendChild(s);
  }
}
createStars(120);

/* ---------- canvas-confetti 调色 ---------- */
const gold = ['#ffd700', '#ffeb99', '#ffb347', '#ff8c00'];
const goldWhite = [...gold, '#ffffff', '#e8eaf6'];

/* 小烟花（点按钮时） */
function miniBurst() {
  confetti({
    particleCount: 30,
    spread: 60,
    origin: { x: 0.5, y: 0.4 },
    colors: gold,
    scalar: 0.7
  });
}

/* 大爆炸（蛋糕出现 & 许愿成功） */
function bigBurst() {
  const duration = 2500;
  const end = Date.now() + duration;
  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60, spread: 55,
      origin: { x: 0 },
      colors: goldWhite
    });
    confetti({
      particleCount: 4,
      angle: 120, spread: 55,
      origin: { x: 1 },
      colors: goldWhite
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

/* 终极爆发（吹蜡烛后） */
function grandFinale() {
  // 中央大爆炸
  confetti({
    particleCount: 200,
    spread: 180,
    origin: { x: 0.5, y: 0.5 },
    colors: goldWhite,
    scalar: 1.3,
    startVelocity: 50
  });
  // 然后持续两侧扫射
  setTimeout(bigBurst, 400);
  setTimeout(() => {
    confetti({
      particleCount: 150,
      spread: 120,
      origin: { x: 0.5, y: 0.3 },
      colors: goldWhite,
      startVelocity: 60
    });
  }, 1200);
}

/* ---------- 阶段 1：烟花按钮 ---------- */
const MAX_CLICKS = 5;
let clickCount = 0;

const btnFire = document.getElementById('btnFire');
const fireCount = document.getElementById('fireCount');

btnFire.addEventListener('click', () => {
  clickCount++;
  miniBurst();

  const remaining = MAX_CLICKS - clickCount;
  if (remaining > 0) {
    fireCount.textContent = `还要点 ${remaining} 下`;
    // 按钮轻微震动反馈
    btnFire.animate(
      [{ transform: 'scale(0.92) rotate(-8deg)' },
       { transform: 'scale(1) rotate(0deg)' }],
      { duration: 200, easing: 'ease-out' }
    );
  } else {
    // 5 次点完 → 进入阶段 2
    fireCount.textContent = '🎉';
    btnFire.disabled = true;
    btnFire.style.opacity = '0.4';

    setTimeout(() => {
      document.getElementById('stageIntro').classList.add('hidden');
      document.getElementById('stageCake').classList.remove('hidden');
      bigBurst();

      // 蛋糕出现过渡
      setTimeout(() => {
        document.getElementById('cakeWrap').classList.remove('hidden');
      }, 1800);
    }, 600);
  }
});

/* ---------- 阶段 2：蛋糕 & 许愿 ---------- */
const cakeWrap = document.getElementById('cakeWrap');
const wishInput = document.getElementById('wishInput');
const btnWish = document.getElementById('btnWish');
const blowArea = document.getElementById('blowArea');
const btnBlow = document.getElementById('btnBlow');

// 单个蜡烛点击（可选互动）
document.querySelectorAll('.candle').forEach(c => {
  c.addEventListener('click', () => {
    if (c.classList.contains('blown')) return;
    c.classList.add('blown');
    confetti({
      particleCount: 10, spread: 30,
      origin: { x: 0.5, y: 0.3 },
      colors: ['#ffd700']
    });
  });
});

// 许愿
btnWish.addEventListener('click', () => {
  const wish = wishInput.value.trim();
  // 不管有没有输入都能继续（允许害羞的宝宝跳过）
  if (!wish) {
    // 没输入 → 给个小提示
    wishInput.animate(
      [{ borderColor: '#ff6b6b' }, { borderColor: '' }],
      { duration: 400 }
    );
    wishInput.focus();
    return;
  }

  // 许愿成功 → 隐藏许愿区，显示吹蜡烛区
  document.getElementById('wishArea').classList.add('hidden');
  blowArea.classList.remove('hidden');
  bigBurst();

  // 小彩蛋：把愿望偷偷挂在页面上（肉眼几乎看不见）
  console.log('✨ 宝宝的愿望：', wish);
});

// 回车快速许愿
wishInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') btnWish.click();
});

/* ---------- 阶段 3：吹蜡烛 → 大爆发 ---------- */
btnBlow.addEventListener('click', () => {
  // 1. 吹灭所有蜡烛
  document.querySelectorAll('.candle').forEach(c => c.classList.add('blown'));

  // 2. 轻轻一"吹"的粒子效果
  confetti({
    particleCount: 15, spread: 40,
    origin: { x: 0.5, y: 0.3 },
    colors: ['#ffffff', '#ffe0b2'],
    scalar: 0.6
  });

  // 3. 停顿一下让用户感受到"吹"的动作
  btnBlow.disabled = true;
  btnBlow.textContent = '许愿中...';

  setTimeout(() => {
    grandFinale();

    // 4. 切换到最终阶段
    setTimeout(() => {
      document.getElementById('stageCake').classList.add('hidden');
      document.getElementById('stageFinal').classList.remove('hidden');
      // 最终再来一轮
      bigBurst();
      setTimeout(grandFinale, 800);
    }, 1500);
  }, 800);
});

/* ---------- 初始化 ---------- */
window.addEventListener('load', () => {
  // 预加载 confetti 确保可用
  if (typeof confetti !== 'function') {
    console.warn('confetti 库加载失败，请检查网络');
  }
});
