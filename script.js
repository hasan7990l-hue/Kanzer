// ============================================
// Firebase
// ============================================
var db = null, addDoc = null, collection = null, getDocs = null;
var deleteDoc = null, doc = null, updateDoc = null;

function connectFirebase() {
  if (window.firebaseDB) {
    db = window.firebaseDB;
    addDoc = window.firebaseAddDoc;
    collection = window.firebaseCollection;
    getDocs = window.firebaseGetDocs;
    deleteDoc = window.firebaseDeleteDoc;
    doc = window.firebaseDoc;
    updateDoc = window.firebaseUpdateDoc;
    console.log('✅ Firebase connected');
    if (typeof loadProductsFromFirestore === 'function') loadProductsFromFirestore();
    var dash = document.getElementById('dashboardPage');
    if (dash && dash.classList.contains('active') && typeof loadDashboardProducts === 'function') loadDashboardProducts();
  } else {
    setTimeout(connectFirebase, 100);
  }
}
connectFirebase();

var YOUTUBE_API_KEY = "AIzaSyBFVOYwVxxd9a07cJelkgfVVfDQHrkoDVQ";

// ============================================
// الجزيئات
// ============================================
var luxuryParticles = document.getElementById('luxuryParticles');
if (luxuryParticles) {
  for (var i = 0; i < 40; i++) {
    var p = document.createElement('div');
    p.style.position = 'absolute';
    p.style.width = (2 + Math.random() * 3) + 'px';
    p.style.height = p.style.width;
    p.style.background = Math.random() > 0.5 ? '#FFC107' : '#0066FF';
    p.style.borderRadius = '50%';
    p.style.left = (Math.random() * 90 + 5) + '%';
    p.style.top = (Math.random() * 90 + 5) + '%';
    p.style.boxShadow = '0 0 10px ' + (Math.random() > 0.5 ? '#FFC107' : '#0066FF');
    p.style.opacity = 0.3 + Math.random() * 0.5;
    p.style.animation = 'floatParticle ' + (5 + Math.random() * 10) + 's infinite ease-in-out';
    p.style.animationDelay = Math.random() * 5 + 's';
    p.style.pointerEvents = 'none';
    luxuryParticles.appendChild(p);
  }
}

// ============================================
// النوافذ
// ============================================
function openModal(id) { var m = document.getElementById(id); if (m) m.classList.add('active'); }
function closeModal(id) { var m = document.getElementById(id); if (m) m.classList.remove('active'); }
function openPrivacy() { openModal('privacyModal'); }
function openAbout() { openModal('aboutModal'); }
function openLogin() { openModal('loginModal'); }
function openProfile() { loadProfile(); openModal('profileModal'); }

var modals = document.querySelectorAll('.modal');
for (var i = 0; i < modals.length; i++) {
  modals[i].addEventListener('click', function(e) { if (e.target === this) this.classList.remove('active'); });
}

// ============================================
// Sidebar
// ============================================
function toggleSidebar() {
  var s = document.getElementById('sidebar'), o = document.getElementById('sidebarOverlay');
  if (s) s.classList.toggle('active'); if (o) o.classList.toggle('active');
  if (navigator.vibrate) navigator.vibrate(10);
}
function closeSidebar() {
  var s = document.getElementById('sidebar'), o = document.getElementById('sidebarOverlay');
  if (s) s.classList.remove('active'); if (o) o.classList.remove('active');
}
function goToHome() { closeSidebar(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function openDashboardWithPassword() {
  var pw = prompt('🔐 أدخل كلمة السر:');
  if (pw === null) return;
  if (pw === 'nakheeb2026') { closeSidebar(); openDashboardPage(); }
  else alert('❌ كلمة السر غلط');
}
function openDashboardPage() {
  var p = document.getElementById('dashboardPage');
  if (p) { p.classList.add('active'); loadDashboardProducts(); }
}
function closeDashboardPage() {
  var p = document.getElementById('dashboardPage');
  if (p) p.classList.remove('active');
}

// ============================================
// 🔐 تسجيل الدخول بـ Google
// ============================================
async function loginWithGoogle() {
  if (!window.firebaseAuth) { alert('⚠️ Firebase مو جاهز'); return; }
  try {
    var result = await window.firebaseSignInWithPopup(window.firebaseAuth, window.firebaseGoogleProvider);
    var user = result.user;
    console.log('✅ Logged in:', user.email);
    try {
      var userRef = window.firebaseDoc(window.firebaseDB, "users", user.uid);
      await window.firebaseSetDoc(userRef, {
        uid: user.uid, name: user.displayName || 'مستخدم', email: user.email,
        avatar: user.photoURL || '', lastLogin: new Date().toISOString()
      }, { merge: true });
    } catch(e) { console.warn('Firestore save failed:', e); }
    localStorage.setItem('nokhba_logged_in', 'true');
    localStorage.setItem('nokhba_user', JSON.stringify({
      uid: user.uid, name: user.displayName || 'مستخدم',
      email: user.email, avatar: user.photoURL || ''
    }));
    if (user.photoURL) updateAvatarDisplay(user.photoURL);
    var nameEl = document.getElementById('profileName'), emailEl = document.getElementById('profileEmail');
    if (nameEl) nameEl.textContent = user.displayName || 'مستخدم';
    if (emailEl) emailEl.textContent = user.email || '';
    updateDropdownInfo();
    closeModal('loginModal');
    var hero = document.getElementById('luxuryHero');
    if (hero) setTimeout(function() { hero.classList.add('hide'); }, 300);
    var mainSite = document.getElementById('mainSite');
    if (mainSite) setTimeout(function() { mainSite.classList.add('show'); window.scrollTo({ top: 0, behavior: 'smooth' }); }, 700);
    showToast('🎉 أهلاً ' + (user.displayName || ''));
  } catch(e) {
    console.error('Login error:', e);
    if (e.code === 'auth/popup-closed-by-user') return;
    if (e.code === 'auth/popup-blocked') { alert('⚠️ المتصفح منع النافذة'); return; }
    alert('❌ خطأ: ' + e.message);
  }
}

async function logout() {
  try { if (window.firebaseAuth) { await window.firebaseSignOut(window.firebaseAuth); console.log('✅ Logged out'); } } catch(e) {}
  try { localStorage.removeItem('nokhba_logged_in'); localStorage.removeItem('nokhba_user'); } catch(e) {}
  var hero = document.getElementById('luxuryHero'), mainSite = document.getElementById('mainSite');
  if (mainSite) mainSite.classList.remove('show');
  if (hero) hero.classList.remove('hide');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  var dropdown = document.getElementById('profileDropdown');
  if (dropdown) dropdown.classList.remove('active');
  if (navigator.vibrate) navigator.vibrate(20);
}

// ============================================
// 🚪 تسجيل خروج من القائمة المنسدلة
// ============================================
function logoutFromDropdown() {
  var dropdown = document.getElementById('profileDropdown');
  if (dropdown) dropdown.classList.remove('active');
  setTimeout(function() { logout(); }, 200);
}

// ============================================
// تحميل الصفحة
// ============================================
window.addEventListener('load', function() {
  var logged = localStorage.getItem('nokhba_logged_in');
  if (logged === 'true') {
    var hero = document.getElementById('luxuryHero'), mainSite = document.getElementById('mainSite');
    if (hero) hero.classList.add('hide');
    if (mainSite) mainSite.classList.add('show');
  }
  var profile = JSON.parse(localStorage.getItem('nokhba_profile') || '{}');
  if (profile.avatar) updateAvatarDisplay(profile.avatar);
});

function scrollToProducts() {
  var s = document.getElementById('productsSection');
  if (s) s.scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// البحث والأقسام
// ============================================
function searchProducts(query) {
  query = query.toLowerCase().trim();
  var cards = document.querySelectorAll('.products-grid .card');
  for (var i = 0; i < cards.length; i++) {
    var n = cards[i].getAttribute('data-name') || '';
    if (query === '' || n.indexOf(query) !== -1) cards[i].classList.remove('hidden');
    else cards[i].classList.add('hidden');
  }
  var btns = document.querySelectorAll('.category-btn');
  for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
  if (btns[0]) btns[0].classList.add('active');
}

function filterCategory(category, btn) {
  var btns = document.querySelectorAll('.category-btn');
  for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
  btn.classList.add('active');
  var si = document.getElementById('searchInput');
  if (si) si.value = '';
  var cards = document.querySelectorAll('.products-grid .card');
  for (var i = 0; i < cards.length; i++) {
    var c = cards[i].getAttribute('data-category') || '';
    if (category === 'all' || c.indexOf(category) !== -1) cards[i].classList.remove('hidden');
    else cards[i].classList.add('hidden');
  }
  if (navigator.vibrate) navigator.vibrate(10);
}

// ============================================
// قاعدة البيانات المحلية
// ============================================
var nokhbaProductsDB = {
  "canon pixma g3411": {
    desc: "طابعة ملونة عالية الجودة بنظام الحبر المستمر.",
    marketing: "🔥 الأكثر مبيعاً — اقتصادية في الحبر!",
    specs: [
      { label: "النوع", value: "طابعة ملونة" }, { label: "التقنية", value: "Inkjet" },
      { label: "السرعة", value: "8.8 صورة/دقيقة" }, { label: "الاتصال", value: "USB + واي فاي" }
    ]
  },
  "canon lbp6030": {
    desc: "طابعة ليزر أبيض وأسود سريعة وموثوقة.",
    marketing: "⚡ أسرع طابعة ليزر بفئتها!",
    specs: [{ label: "النوع", value: "طابعة ليزر" }, { label: "السرعة", value: "18 صورة/دقيقة" }]
  },
  "canon pixma ts3320": {
    desc: "طابعة منزلية متعددة الوظائف.",
    marketing: "✨ 3 أجهزة في جهاز واحد!",
    specs: [{ label: "النوع", value: "طابعة متعددة" }, { label: "الوظائف", value: "طباعة + مسح + نسخ" }]
  }
};

function nokheebLookup(name) {
  var key = name.toLowerCase().trim();
  if (nokhbaProductsDB[key]) return nokhbaProductsDB[key];
  var keys = Object.keys(nokhbaProductsDB);
  for (var i = 0; i < keys.length; i++) {
    if (key.indexOf(keys[i]) !== -1 || keys[i].indexOf(key) !== -1) return nokhbaProductsDB[keys[i]];
  }
  return {
    desc: "منتج أصلي من نُخبة — جودة عالية.",
    marketing: "✨ اختيار النخبة — جودة مضمونة!",
    specs: [{ label: "النوع", value: "طابعة" }, { label: "الأصالة", value: "أصلي 100%" }]
  };
}

// ============================================
// تحميل المنتجات
// ============================================
async function loadProductsFromFirestore() {
  if (!db) return;
  try {
    var qs = await getDocs(collection(db, "products"));
    var grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    if (qs.size === 0) {
      grid.innerHTML = '<p style="color:#888;text-align:center;padding:40px;grid-column:1/-1;">ما فيه منتجات حالياً</p>';
      return;
    }
    qs.forEach(function(docSnap) { grid.appendChild(createProductCard(docSnap.data(), docSnap.id)); });
    setupSliders(); setupDetailsButtons(); setupContactButtons(); setupRippleEffect(); setup3DTilt();
  } catch(e) { console.log('Firestore error:', e); }
}

function getYouTubeId(url) {
  if (!url) return '';
  var m = url.match(/embed\/([^?&]+)/);
  return m ? m[1] : '';
}

function createProductCard(data, firestoreId) {
  var card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('data-category', data.category || 'new');
  card.setAttribute('data-name', (data.name || '').toLowerCase());

  var videoHTML = '';
  if (data.videoUrl) {
    if (data.videoType === 'youtube' || data.videoUrl.indexOf('youtube.com/embed') !== -1) {
      var ytId = getYouTubeId(data.videoUrl);
      videoHTML = '<iframe class="product-video" src="https://www.youtube.com/embed/' + ytId + '?autoplay=1&mute=1&loop=1&playlist=' + ytId + '&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
    } else {
      videoHTML = '<video class="product-video" autoplay muted loop playsinline><source src="' + data.videoUrl + '" type="video/mp4"></video>';
    }
  }

  var imagesHTML = '<img src="https://picsum.photos/seed/' + (firestoreId || 'p') + '/400/300" alt="1">';
  if (data.images && data.images.length > 0) {
    imagesHTML = '';
    for (var i = 0; i < data.images.length; i++) imagesHTML += '<img src="' + data.images[i] + '" alt="' + (i+1) + '">';
  }

  var marketingHTML = '';
  if (data.marketing) marketingHTML = '<div class="marketing-msg">' + data.marketing + '</div>';

  card.innerHTML = '<div class="card-glow"></div>' +
    '<div class="slider">' + videoHTML + '<div class="slides">' + imagesHTML + '</div></div>' +
    '<div class="content">' +
      '<h3>' + (data.name || 'منتج') + '</h3>' +
      '<p class="desc">' + (data.desc || '') + '</p>' +
      marketingHTML +
      '<button class="btn details-btn" data-id="' + (firestoreId || '') + '">تفاصيل الجهاز</button>' +
      '<button class="btn contact-btn">تواصل معنا</button>' +
    '</div>';
  return card;
}

function setupSliders() {
  var all = document.querySelectorAll('.slider');
  for (var s = 0; s < all.length; s++) {
    (function(slider) {
      if (slider.getAttribute('data-ready')) return;
      slider.setAttribute('data-ready', 'true');
      var slides = slider.querySelector('.slides');
      if (!slides) return;
      var total = slides.querySelectorAll('img').length;
      if (total === 0) return;
      var cur = 0, sx = 0, drag = false;
      slider.addEventListener('touchstart', function(e) { sx = e.touches[0].clientX; drag = true; });
      slider.addEventListener('touchmove', function(e) {
        if (!drag) return;
        var d = sx - e.touches[0].clientX;
        if (Math.abs(d) > 50) {
          cur = d > 0 ? (cur + 1) % total : (cur - 1 + total) % total;
          slides.style.transform = 'translateX(-' + (cur * 100) + '%)';
          drag = false;
        }
      });
      slider.addEventListener('touchend', function() { drag = false; });
    })(all[s]);
  }
}

function setupDetailsButtons() {
  var btns = document.querySelectorAll('.details-btn');
  for (var i = 0; i < btns.length; i++) {
    (function(btn) {
      if (btn.getAttribute('data-ready')) return;
      btn.setAttribute('data-ready', 'true');
      btn.addEventListener('click', function() {
        var id = btn.getAttribute('data-id');
        if (id) openProductDetails(id);
      });
    })(btns[i]);
  }
}

async function openProductDetails(id) {
  if (!id || !db) return;
  try {
    var all = await getDocs(collection(db, "products"));
    var found = null, foundId = null;
    all.forEach(function(d) { if (d.id === id) { found = d.data(); foundId = d.id; } });
    if (!found) return;
    if (found.aiSummary) { showAIDetailsModal(found, found.aiSummary); return; }
    showDetailsLoading(found.name);
    var summary = null;
    if (typeof aiMakeProfessionalSummary === 'function') {
      summary = await aiMakeProfessionalSummary(found.name, found.desc, found.specs || []);
    }
    if (summary) {
      if (updateDoc && doc) {
        try { await updateDoc(doc(db, "products", foundId), { aiSummary: summary }); } catch(e) {}
      }
      showAIDetailsModal(found, summary);
    } else {
      showProductModal(found.name, found.desc, found.specs || [], found.marketing);
    }
  } catch(e) { console.error(e); }
}

function showDetailsLoading(name) {
  var m = document.getElementById('detailsModal');
  if (!m) return;
  var c = m.querySelector('.modal-content');
  if (!c) return;
  c.innerHTML = '<div class="ai-loading"><div class="ai-loading-spinner"></div><h2>' + (name || '') + '</h2><p>🤖 NAKHEEB AI يحضّر الملخص...</p></div>';
  openModal('detailsModal');
}

function showAIDetailsModal(product, ai) {
  var m = document.getElementById('detailsModal');
  if (!m) return;
  var c = m.querySelector('.modal-content');
  if (!c) return;
  var hh = '';
  if (ai.highlights && ai.highlights.length) {
    for (var i = 0; i < ai.highlights.length; i++) hh += '<li class="ai-highlight-item"><span class="ai-check">✓</span>' + ai.highlights[i] + '</li>';
  }
  var sh = '';
  if (product.specs && product.specs.length) {
    for (var i = 0; i < product.specs.length; i++) {
      var s = product.specs[i], v = s.value;
      if (/[A-Za-z]/.test(v)) v = '<span dir="ltr">' + v + '</span>';
      sh += '<li><strong>' + s.label + ':</strong> ' + v + '</li>';
    }
  }
  c.innerHTML = '<div class="ai-details-wrapper">' +
    '<div class="ai-details-header"><div class="ai-badge">🤖 ملخص ذكي</div>' +
    '<h2 class="ai-details-title">' + (product.name || '-') + '</h2>' +
    (ai.tagline ? '<p class="ai-details-tagline">' + ai.tagline + '</p>' : '') + '</div>' +
    (ai.summary ? '<div class="ai-details-summary"><p>' + ai.summary + '</p></div>' : '') +
    (hh ? '<div class="ai-details-block"><h4 class="ai-block-title">⭐ المميزات</h4><ul class="ai-highlights-list">' + hh + '</ul></div>' : '') +
    (ai.bestFor ? '<div class="ai-bestfor"><span class="ai-bestfor-icon">🎯</span><span>' + ai.bestFor + '</span></div>' : '') +
    (sh ? '<div class="ai-details-block"><h4 class="ai-block-title">📋 المواصفات</h4><ul class="specs-list" dir="rtl">' + sh + '</ul></div>' : '') +
    '<div class="modal-buttons"><button class="back-btn" onclick="closeModal(\'detailsModal\')"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg></button><button class="btn contact-btn">تواصل معنا</button></div></div>';
  if (typeof setupContactButtons === 'function') setupContactButtons();
  openModal('detailsModal');
  if (navigator.vibrate) navigator.vibrate(10);
}

function showProductModal(name, desc, specs, marketing) {
  var m = document.getElementById('detailsModal');
  if (!m) return;
  var c = m.querySelector('.modal-content');
  if (!c) return;
  var mh = marketing ? '<div class="marketing-msg" style="margin-top:15px;">' + marketing + '</div>' : '';
  var sh = '';
  if (specs && specs.length) {
    for (var i = 0; i < specs.length; i++) {
      var s = specs[i], v = s.value;
      if (/[A-Za-z]/.test(v)) v = '<span dir="ltr">' + v + '</span>';
      sh += '<li><strong>' + s.label + ':</strong> ' + v + '</li>';
    }
  }
  c.innerHTML = '<h2>' + (name || '-') + '</h2><h4>الوصف:</h4><p>' + (desc || '-') + '</p>' + mh +
    '<h4>المواصفات:</h4><ul class="specs-list" dir="rtl">' + sh + '</ul>' +
    '<div class="modal-buttons"><button class="back-btn" onclick="closeModal(\'detailsModal\')"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg></button><button class="btn contact-btn">تواصل معنا</button></div>';
  if (typeof setupContactButtons === 'function') setupContactButtons();
  openModal('detailsModal');
}

function setupContactButtons() {
  var btns = document.querySelectorAll('.contact-btn');
  for (var i = 0; i < btns.length; i++) {
    (function(btn) {
      if (btn.getAttribute('data-ready')) return;
      btn.setAttribute('data-ready', 'true');
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var menu = document.getElementById('contactMenu');
        if (menu) menu.classList.toggle('active');
      });
    })(btns[i]);
  }
}

document.addEventListener('click', function(e) {
  var menu = document.getElementById('contactMenu');
  if (menu && menu.classList.contains('active') && !menu.contains(e.target)) menu.classList.remove('active');
});

function setupRippleEffect() {
  var btns = document.querySelectorAll('.btn');
  for (var i = 0; i < btns.length; i++) {
    (function(btn) {
      if (btn.getAttribute('data-ripple-ready')) return;
      btn.setAttribute('data-ripple-ready', 'true');
      btn.addEventListener('click', function(e) {
        var r = this.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        var size = Math.max(r.width, r.height);
        var ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (x - size/2) + 'px';
        ripple.style.top = (y - size/2) + 'px';
        this.appendChild(ripple);
        setTimeout(function() { ripple.remove(); }, 600);
      });
    })(btns[i]);
  }
}

function setup3DTilt() {
  var cards = document.querySelectorAll('.card');
  for (var i = 0; i < cards.length; i++) {
    (function(card) {
      if (card.getAttribute('data-tilt-ready')) return;
      card.setAttribute('data-tilt-ready', 'true');
      var glow = card.querySelector('.card-glow');
      card.addEventListener('mousemove', function(e) {
        var r = card.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        var cx = r.width/2, cy = r.height/2;
        card.style.transform = 'perspective(1200px) rotateX(' + ((y-cy)/50) + 'deg) rotateY(' + ((cx-x)/50) + 'deg) scale(1.02)';
        if (glow) { glow.style.left = x + 'px'; glow.style.top = y + 'px'; glow.style.opacity = '1'; glow.style.transform = 'translate(-50%, -50%)'; }
      });
      card.addEventListener('mouseleave', function() {
        card.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) scale(1)';
        if (glow) glow.style.opacity = '0';
      });
    })(cards[i]);
  }
}

// ============================================
// القائمة المنسدلة
// ============================================
function toggleProfileMenu(e) {
  if (e) e.stopPropagation();
  var d = document.getElementById('profileDropdown');
  if (d) { d.classList.toggle('active'); if (d.classList.contains('active')) updateDropdownInfo(); }
}

function updateDropdownInfo() {
  var user = JSON.parse(localStorage.getItem('nokhba_user') || '{}');
  var profile = JSON.parse(localStorage.getItem('nokhba_profile') || '{}');
  var n = document.getElementById('dropdownName'), e = document.getElementById('dropdownEmail');
  if (n) n.textContent = user.name || profile.name || 'المستخدم';
  if (e) e.textContent = user.email || profile.email || 'user@gmail.com';
  var av = user.avatar || profile.avatar;
  if (av) { var da = document.getElementById('dropdownAvatar'); if (da) da.innerHTML = '<img src="' + av + '" alt="avatar">'; }
}

function openProfileFromDropdown() {
  document.getElementById('profileDropdown').classList.remove('active');
  openProfile();
}

document.addEventListener('click', function(e) {
  var d = document.getElementById('profileDropdown'), w = document.querySelector('.profile-menu-wrapper');
  if (d && d.classList.contains('active')) {
    if (w && !w.contains(e.target) && !d.contains(e.target)) d.classList.remove('active');
  }
});

// ============================================
// الملف الشخصي
// ============================================
function loadProfile() {
  var user = JSON.parse(localStorage.getItem('nokhba_user') || '{}');
  var profile = JSON.parse(localStorage.getItem('nokhba_profile') || '{}');
  var ni = document.getElementById('profileNameInput'), pi = document.getElementById('profilePhoneInput'), ai = document.getElementById('profileAddressInput');
  var nd = document.getElementById('profileName'), ed = document.getElementById('profileEmail');
  if (ni) ni.value = profile.name || user.name || '';
  if (pi) pi.value = profile.phone || '';
  if (ai) ai.value = profile.address || '';
  if (nd) nd.textContent = user.name || profile.name || 'المستخدم';
  if (ed) ed.textContent = user.email || profile.email || 'user@gmail.com';
  var av = user.avatar || profile.avatar;
  if (av) updateAvatarDisplay(av);
}

function updateAvatarDisplay(url) {
  var s = document.getElementById('profileAvatar'), l = document.getElementById('profileAvatarLarge'), d = document.getElementById('dropdownAvatar');
  var h = '<img src="' + url + '" alt="avatar">';
  if (s) s.innerHTML = h; if (l) l.innerHTML = h; if (d) d.innerHTML = h;
}

function uploadAvatar(event) {
  var f = event.target.files[0];
  if (!f) return;
  if (f.size > 2 * 1024 * 1024) { alert('الصورة كبيرة'); return; }
  var r = new FileReader();
  r.onload = function(e) {
    var url = e.target.result;
    var p = JSON.parse(localStorage.getItem('nokhba_profile') || '{}');
    p.avatar = url;
    localStorage.setItem('nokhba_profile', JSON.stringify(p));
    updateAvatarDisplay(url);
  };
  r.readAsDataURL(f);
}

function updateProfile() {
  var ni = document.getElementById('profileNameInput'), pi = document.getElementById('profilePhoneInput'), ai = document.getElementById('profileAddressInput');
  var p = JSON.parse(localStorage.getItem('nokhba_profile') || '{}');
  p.name = ni ? ni.value : ''; p.phone = pi ? pi.value : ''; p.address = ai ? ai.value : '';
  localStorage.setItem('nokhba_profile', JSON.stringify(p));
  var nd = document.getElementById('profileName');
  if (nd) nd.textContent = p.name || 'المستخدم';
}

function saveProfile() { updateProfile(); closeModal('profileModal'); showToast('تم حفظ التغييرات'); }

function showToast(msg) {
  var t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function() { t.classList.add('show'); }, 100);
  setTimeout(function() { t.classList.remove('show'); setTimeout(function() { t.remove(); }, 300); }, 2500);
}

// ============================================
// التقييم
// ============================================
var ratingStars = document.querySelectorAll('.star');
var ratingAverage = document.querySelector('.rating-average');
var ratingCount = document.querySelector('.rating-count');
var ratingThanks = document.getElementById('ratingThanks');
var ratingsData = { totalRatings: 0, sumRatings: 0, userRating: 0 };

function loadRatings() {
  try {
    var s = localStorage.getItem('nokhba_ratings');
    if (s) { var p = JSON.parse(s); ratingsData.totalRatings = p.totalRatings || 0; ratingsData.sumRatings = p.sumRatings || 0; ratingsData.userRating = p.userRating || 0; }
  } catch(e) {}
  updateRatingDisplay();
}

function saveRatings() { try { localStorage.setItem('nokhba_ratings', JSON.stringify(ratingsData)); } catch(e) {} }

function updateRatingDisplay() {
  var avg = ratingsData.totalRatings > 0 ? ratingsData.sumRatings / ratingsData.totalRatings : 0;
  if (ratingAverage) ratingAverage.textContent = avg.toFixed(1);
  if (ratingCount) {
    var c = ratingsData.totalRatings, l = 'تقييم';
    if (c === 0) l = 'لا يوجد تقييم'; else if (c === 1) l = 'تقييم واحد'; else if (c === 2) l = 'تقييمان';
    ratingCount.textContent = '(' + c + ' ' + l + ')';
  }
  if (ratingsData.userRating > 0) {
    for (var i = 0; i < ratingStars.length; i++) {
      var v = parseInt(ratingStars[i].getAttribute('data-value'));
      if (v <= ratingsData.userRating) ratingStars[i].classList.add('active');
      else ratingStars[i].classList.remove('active');
    }
  }
}

function setRating(value) {
  if (ratingsData.userRating > 0) { ratingsData.sumRatings -= ratingsData.userRating; ratingsData.totalRatings -= 1; }
  ratingsData.userRating = value;
  ratingsData.sumRatings += value; ratingsData.totalRatings += 1;
  saveRatings(); updateRatingDisplay();
  for (var i = 0; i < ratingStars.length; i++) {
    var v = parseInt(ratingStars[i].getAttribute('data-value'));
    if (v <= value) ratingStars[i].classList.add('active');
  }
  if (ratingThanks) {
    ratingThanks.classList.remove('show');
    setTimeout(function() { ratingThanks.classList.add('show'); }, 100);
    setTimeout(function() { ratingThanks.classList.remove('show'); }, 3000);
  }
  if (navigator.vibrate) navigator.vibrate(15);
}

for (var i = 0; i < ratingStars.length; i++) {
  (function(star) {
    var v = parseInt(star.getAttribute('data-value'));
    star.addEventListener('click', function() { setRating(v); });
    star.addEventListener('touchend', function(e) { e.preventDefault(); setRating(v); });
  })(ratingStars[i]);
}
loadRatings();

// ============================================
// يوتيوب
// ============================================
function useYoutubeUrl(url) {
  if (!url || url.length < 10) return;
  var vid = extractYoutubeId(url);
  if (!vid) return;
  window.selectedVideoUrl = 'https://www.youtube.com/embed/' + vid;
  window.selectedVideoType = 'youtube';
  window.selectedVideoTitle = 'Custom video';
  showToast('✅ تم تفعيل الرابط');
}

function extractYoutubeId(url) {
  if (!url) return '';
  var patterns = [/(?:youtube\.com\/watch\?v=)([^&]+)/, /(?:youtu\.be\/)([^?&]+)/, /(?:youtube\.com\/embed\/)([^?&]+)/, /(?:youtube\.com\/shorts\/)([^?&]+)/];
  for (var i = 0; i < patterns.length; i++) { var m = url.match(patterns[i]); if (m) return m[1]; }
  return '';
}

function parseYouTubeDuration(d) {
  var m = d.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return parseInt(m[1]||0)*3600 + parseInt(m[2]||0)*60 + parseInt(m[3]||0);
}

async function searchYouTubeVideos() {
  var q = document.getElementById('dashProductName').value.trim();
  if (!q) { alert('اكتب اسم المنتج'); return; }
  var rd = document.getElementById('dashVideoResults');
  rd.innerHTML = '<p style="text-align:center;color:#4D94FF;">🔍 يبحث عن فيديوهات قصيرة...</p>';
  try {
    var sUrl = 'https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + encodeURIComponent(q + ' printer') + '&type=video&videoDuration=short&videoEmbeddable=true&maxResults=15&key=' + YOUTUBE_API_KEY;
    var sRes = await fetch(sUrl);
    var sData = await sRes.json();
    if (sData.error) { rd.innerHTML = '<p style="color:#FF6B6B;text-align:center;">خطأ: ' + sData.error.message + '</p>'; return; }
    if (!sData.items || sData.items.length === 0) { rd.innerHTML = '<p style="color:#FF6B6B;text-align:center;">ما لقيت فيديوهات</p>'; return; }

    var ids = sData.items.map(function(i) { return i.id.videoId; }).join(',');
    var dUrl = 'https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=' + ids + '&key=' + YOUTUBE_API_KEY;
    var dRes = await fetch(dUrl);
    var dData = await dRes.json();
    if (dData.error) { rd.innerHTML = '<p style="color:#FF6B6B;text-align:center;">خطأ</p>'; return; }

    var filtered = [], backup = [];
    dData.items.forEach(function(it) {
      var s = parseYouTubeDuration(it.contentDetails.duration);
      var o = { id: it.id, title: it.snippet.title, thumbnail: it.snippet.thumbnails.medium.url, duration: s };
      if (s >= 15 && s <= 60) filtered.push(o);
      backup.push(o);
    });

    if (filtered.length === 0) {
      backup.sort(function(a,b) { return a.duration - b.duration; });
      filtered = backup.slice(0, 6);
    } else {
      filtered.sort(function(a,b) { return Math.abs(a.duration-30) - Math.abs(b.duration-30); });
      filtered = filtered.slice(0, 9);
    }

    rd.innerHTML = '';
    var grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(2,1fr);gap:10px;';
    filtered.forEach(function(it) {
      var dt = it.duration + ' ث';
      var vi = document.createElement('div');
      vi.style.cssText = 'position:relative;cursor:pointer;border-radius:12px;overflow:hidden;border:2px solid rgba(0,102,255,0.3);background:#0a1628;';
      vi.innerHTML = '<img src="' + it.thumbnail + '" style="width:100%;height:120px;object-fit:cover;display:block;" alt=""><div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.85);color:#fff;padding:6px;font-size:10px;text-align:center;line-height:1.3;">' + it.title.substring(0,35) + '...<br><span style="color:#FFC107;">⏱ ' + dt + '</span></div>';
      vi.addEventListener('click', function() {
        var all = document.querySelectorAll('#dashVideoResults > div > div');
        for (var x = 0; x < all.length; x++) { all[x].style.borderColor = 'rgba(0,102,255,0.3)'; all[x].style.borderWidth = '2px'; }
        vi.style.borderColor = '#00C853'; vi.style.borderWidth = '3px';
        window.selectedVideoUrl = 'https://www.youtube.com/embed/' + it.id;
        window.selectedVideoType = 'youtube';
        window.selectedVideoTitle = it.title;
        showToast('✅ تم اختيار الفيديو (' + dt + ')');
      });
      grid.appendChild(vi);
    });
    rd.appendChild(grid);
  } catch(e) { rd.innerHTML = '<p style="color:#FF6B6B;text-align:center;">خطأ: ' + e.message + '</p>'; }
}

// ============================================
// Dashboard - نشر
// ============================================
async function publishProduct() {
  var name = document.getElementById('dashProductName').value.trim();
  var desc = document.getElementById('dashProductDesc').value.trim();
  var cat = document.getElementById('dashProductCategory').value;
  if (!name) { alert('اكتب اسم المنتج'); return; }
  if (!window.selectedVideoUrl) { alert('اختر فيديو'); return; }
  if (!db) { alert('Firebase مو متصل'); return; }
  var s = document.getElementById('dashStatus');
  s.innerHTML = '🎯 يحلل...';
  try {
    var info = nokheebLookup(name);
    s.innerHTML = '📤 ينشر...';
    await addDoc(collection(db, "products"), {
      name: name, desc: (desc || info.desc), marketing: info.marketing, category: cat,
      videoUrl: window.selectedVideoUrl, videoType: window.selectedVideoType || 'mp4',
      videoTitle: window.selectedVideoTitle || '', specs: info.specs, images: [],
      createdAt: new Date().toISOString()
    });
    s.innerHTML = '✅ تم النشر!';
    showToast('🎉 تم نشر المنتج');
    document.getElementById('dashProductName').value = '';
    document.getElementById('dashProductDesc').value = '';
    document.getElementById('dashYoutubeUrl').value = '';
    document.getElementById('dashVideoResults').innerHTML = '';
    window.selectedVideoUrl = null;
    setTimeout(function() { loadProductsFromFirestore(); loadDashboardProducts(); s.innerHTML = ''; }, 1500);
  } catch(e) { s.innerHTML = '❌ خطأ: ' + e.message; }
}

async function loadDashboardProducts() {
  if (!db) return;
  var ld = document.getElementById('dashProductsList');
  if (!ld) return;
  ld.innerHTML = '<p style="color:#888;text-align:center;">جاري التحميل...</p>';
  try {
    var qs = await getDocs(collection(db, "products"));
    if (qs.size === 0) { ld.innerHTML = '<p style="color:#888;text-align:center;padding:20px;">ما فيه منتجات</p>'; return; }
    ld.innerHTML = '';
    qs.forEach(function(ds) {
      var d = ds.data();
      var it = document.createElement('div');
      it.className = 'dash-product-item';
      it.innerHTML = '<div class="dash-product-info"><span class="dash-product-name">' + (d.name||'منتج') + '</span><span class="dash-product-cat">' + (d.category||'') + '</span></div><button class="dash-delete-btn" onclick="deleteProduct(\'' + ds.id + '\', \'' + (d.name||'').replace(/'/g,'') + '\')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>';
      ld.appendChild(it);
    });
  } catch(e) { ld.innerHTML = '<p style="color:#FF6B6B;text-align:center;">خطأ</p>'; }
}

async function deleteProduct(id, name) {
  if (!confirm('تريد تمسح: ' + name + ' ؟')) return;
  try { await deleteDoc(doc(db, "products", id)); showToast('🗑️ تم المسح'); loadDashboardProducts(); setTimeout(loadProductsFromFirestore, 500); }
  catch(e) { alert('خطأ: ' + e.message); }
}

// ============================================
// 🔍 مراقبة حالة تسجيل الدخول
// ============================================
function initAuthListener() {
  if (!window.firebaseOnAuthStateChanged || !window.firebaseAuth) { setTimeout(initAuthListener, 500); return; }
  window.firebaseOnAuthStateChanged(window.firebaseAuth, function(user) {
    if (user) {
      console.log('👤 User active:', user.email);
      localStorage.setItem('nokhba_logged_in', 'true');
      localStorage.setItem('nokhba_user', JSON.stringify({ uid: user.uid, name: user.displayName || 'مستخدم', email: user.email, avatar: user.photoURL || '' }));
      if (user.photoURL) updateAvatarDisplay(user.photoURL);
      var hero = document.getElementById('luxuryHero'), mainSite = document.getElementById('mainSite');
      if (hero) hero.classList.add('hide'); if (mainSite) mainSite.classList.add('show');
    } else {
      console.log('👤 No user');
      localStorage.removeItem('nokhba_logged_in');
      localStorage.removeItem('nokhba_user');
      var hero = document.getElementById('luxuryHero'), mainSite = document.getElementById('mainSite');
      if (hero) hero.classList.remove('hide'); if (mainSite) mainSite.classList.remove('show');
    }
  });
}
initAuthListener();

// ============================================
// تشغيل
// ============================================
setupSliders();
setupDetailsButtons();
setupContactButtons();
setupRippleEffect();
setup3DTilt();
