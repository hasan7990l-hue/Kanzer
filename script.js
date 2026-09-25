// ============ الجزيئات ============
var luxuryParticles = document.getElementById('luxuryParticles');
if (luxuryParticles) {
  for (var i = 0; i < 40; i++) {
    var p = document.createElement('div');
    p.style.position = 'absolute';
    p.style.width = (2 + Math.random() * 3) + 'px';
    p.style.height = p.style.width;
    p.style.background = Math.random() > 0.5 ? '#FFC107' : '#0066FF';
    p.style.borderRadius = '50%';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.boxShadow = '0 0 10px ' + (Math.random() > 0.5 ? '#FFC107' : '#0066FF');
    p.style.opacity = 0.3 + Math.random() * 0.5;
    p.style.animation = 'floatParticle ' + (5 + Math.random() * 10) + 's infinite ease-in-out';
    p.style.animationDelay = Math.random() * 5 + 's';
    luxuryParticles.appendChild(p);
  }
}

// ============ النوافذ ============
function openModal(id) {
  var modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  var modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

function openPrivacy() { openModal('privacyModal'); }
function openAbout() { openModal('aboutModal'); }
function openLogin() { openModal('loginModal'); }
function openProfile() { loadProfile(); openModal('profileModal'); }

var modals = document.querySelectorAll('.modal');
for (var i = 0; i < modals.length; i++) {
  modals[i].addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('active');
  });
}

// ============ تسجيل الدخول ============
function loginWithGoogle() {
  localStorage.setItem('nokhba_logged_in', 'true');
  closeModal('loginModal');
  
  var hero = document.getElementById('luxuryHero');
  if (hero) setTimeout(function() { hero.classList.add('hide'); }, 300);
  
  var mainSite = document.getElementById('mainSite');
  if (mainSite) {
    setTimeout(function() {
      mainSite.classList.add('show');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 700);
  }
}

function logout() {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch(e) {}
  
  // نخفي الموقع ونظهر المقدمة
  var hero = document.getElementById('luxuryHero');
  var mainSite = document.getElementById('mainSite');
  
  if (mainSite) mainSite.classList.remove('show');
  if (hero) hero.classList.remove('hide');
  
  // نرجع لأعلى
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // نغلق القائمة المنسدلة
  var dropdown = document.getElementById('profileDropdown');
  if (dropdown) dropdown.classList.remove('active');
  
  // اهتزاز
  if (navigator.vibrate) navigator.vibrate(20);
}
// ============ تحميل الصفحة ============
window.addEventListener('load', function() {
  var isLoggedIn = localStorage.getItem('nokhba_logged_in');
  
  if (isLoggedIn === 'true') {
    var hero = document.getElementById('luxuryHero');
    var mainSite = document.getElementById('mainSite');
    if (hero) hero.classList.add('hide');
    if (mainSite) mainSite.classList.add('show');
  }
  
  var profile = JSON.parse(localStorage.getItem('nokhba_profile') || '{}');
  if (profile.avatar) updateAvatarDisplay(profile.avatar);
  
  var settings = JSON.parse(localStorage.getItem('nokhba_settings') || '{}');
  if (settings.darkMode) document.body.classList.add('dark-mode');
});

// ============ تصفح المنتجات ============
function scrollToProducts() {
  var productsSection = document.getElementById('productsSection');
  if (productsSection) productsSection.scrollIntoView({ behavior: 'smooth' });
}

// ============ الأقسام ============
function filterCategory(category, btn) {
  var allBtns = document.querySelectorAll('.category-btn');
  for (var i = 0; i < allBtns.length; i++) allBtns[i].classList.remove('active');
  btn.classList.add('active');
  
  var cards = document.querySelectorAll('.products-grid .card');
  for (var i = 0; i < cards.length; i++) {
    var cardCategories = cards[i].getAttribute('data-category') || '';
    if (category === 'all' || cardCategories.indexOf(category) !== -1) {
      cards[i].classList.remove('hidden');
    } else {
      cards[i].classList.add('hidden');
    }
  }
  
  if (navigator.vibrate) navigator.vibrate(10);
}

// ============================================
// بيانات المنتجات
// ============================================
var productsData = {
  1: {
    name: "Canon PIXMA G3411",
    price: "250,000 د.ع",
    desc: "طابعة ملونة عالية الجودة، مناسبة للمنازل والمكاتب الصغيرة. تتميز بنظام الحبر المستمر، وواي فاي مدمج، وسرعة طباعة عالية.",
    specs: [
      { label: "النوع", value: "طابعة ملونة" },
      { label: "التقنية", value: "Inkjet" },
      { label: "السرعة", value: "8.8 صورة/دقيقة" },
      { label: "الاتصال", value: "USB + واي فاي" },
      { label: "الحبر", value: "مستمر (GI-490)" },
      { label: "الضمان", value: "سنة كاملة" },
      { label: "المنشأ", value: "اليابان" }
    ]
  },
  2: {
    name: "Canon LBP6030",
    price: "180,000 د.ع",
    desc: "طابعة ليزر أبيض وأسود، مثالية للمنازل والمكاتب الصغيرة. سرعة عالية، وجودة طباعة ممتازة، وتوفير في الطاقة.",
    specs: [
      { label: "النوع", value: "طابعة ليزر" },
      { label: "التقنية", value: "Laser" },
      { label: "السرعة", value: "18 صورة/دقيقة" },
      { label: "الاتصال", value: "USB" },
      { label: "اللون", value: "أبيض وأسود" },
      { label: "الضمان", value: "سنة كاملة" },
      { label: "المنشأ", value: "اليابان" }
    ]
  },
  3: {
    name: "Canon PIXMA TS3320",
    price: "150,000 د.ع",
    desc: "طابعة منزلية متعددة الوظائف، تطبع وتمسح وتنسخ. متوافقة مع الواي فاي، ومناسبة للاستخدام اليومي.",
    specs: [
      { label: "النوع", value: "طابعة متعددة" },
      { label: "التقنية", value: "Inkjet" },
      { label: "السرعة", value: "7.7 صورة/دقيقة" },
      { label: "الاتصال", value: "USB + واي فاي" },
      { label: "الوظائف", value: "طباعة + مسح + نسخ" },
      { label: "الضمان", value: "سنة كاملة" },
      { label: "المنشأ", value: "اليابان" }
    ]
  },
  4: {
    name: "Canon MAXIFY GX6010",
    price: "450,000 د.ع",
    desc: "طابعة مكتبية احترافية، مصممة للشركات والمكاتب الكبيرة. سرعة عالية، وتكلفة تشغيل منخفضة، وجودة طباعة احترافية.",
    specs: [
      { label: "النوع", value: "طابعة مكتبية" },
      { label: "التقنية", value: "Inkjet" },
      { label: "السرعة", value: "24 صورة/دقيقة" },
      { label: "الاتصال", value: "USB + واي فاي + Ethernet" },
      { label: "الوظائف", value: "طباعة + مسح + نسخ + فاكس" },
      { label: "الضمان", value: "سنة كاملة" },
      { label: "المنشأ", value: "اليابان" }
    ]
  },
  5: {
    name: "Canon SELPHY CP1300",
    price: "200,000 د.ع",
    desc: "طابعة صور محمولة، تطبع صور بجودة عالية من هاتفك. مثالية للمناسبات والسفر، مع بطارية قابلة للشحن.",
    specs: [
      { label: "النوع", value: "طابعة صور" },
      { label: "التقنية", value: "Dye-Sublimation" },
      { label: "الاتصال", value: "واي فاي + USB" },
      { label: "الشاشة", value: "3.2 بوصة" },
      { label: "البطارية", value: "قابلة للشحن" },
      { label: "الضمان", value: "سنة كاملة" },
      { label: "المنشأ", value: "اليابان" }
    ]
  },
  6: {
    name: "Canon PIXMA MG3620",
    price: "170,000 د.ع",
    desc: "طابعة ملونة اقتصادية، مثالية للاستخدام المنزلي. تطبع وتمسح وتنسخ، مع اتصال واي فاي سهل.",
    specs: [
      { label: "النوع", value: "طابعة متعددة" },
      { label: "التقنية", value: "Inkjet" },
      { label: "السرعة", value: "9.9 صورة/دقيقة" },
      { label: "الاتصال", value: "USB + واي فاي" },
      { label: "الوظائف", value: "طباعة + مسح + نسخ" },
      { label: "الضمان", value: "سنة كاملة" },
      { label: "المنشأ", value: "اليابان" }
    ]
  }
};

// ============ فتح تفاصيل المنتج ============
function openProductDetails(id) {
  var product = productsData[id];
  if (!product) return;
  
  var titleEl = document.getElementById('detailsTitle');
  var priceEl = document.getElementById('detailsPrice');
  var descEl = document.getElementById('detailsDesc');
  var specsEl = document.getElementById('detailsSpecs');
  
  if (titleEl) titleEl.textContent = product.name;
  if (priceEl) priceEl.textContent = product.price;
  if (descEl) descEl.textContent = product.desc;
  
  if (specsEl) {
    specsEl.innerHTML = '';
    for (var i = 0; i < product.specs.length; i++) {
      var li = document.createElement('li');
      var spec = product.specs[i];
      
      var valueHTML = spec.value;
      if (/[A-Za-z]/.test(spec.value)) {
        valueHTML = '<span dir="ltr">' + spec.value + '</span>';
      }
      
      li.innerHTML = '<strong>' + spec.label + ':</strong> ' + valueHTML;
      specsEl.appendChild(li);
    }
  }
  
  openModal('detailsModal');
  if (navigator.vibrate) navigator.vibrate(10);
}

// ============ ربط أزرار التفاصيل ============
var detailsButtons = document.querySelectorAll('.details-btn');
for (var i = 0; i < detailsButtons.length; i++) {
  (function(btn) {
    btn.addEventListener('click', function() {
      var id = btn.getAttribute('data-id');
      if (id) openProductDetails(id);
    });
  })(detailsButtons[i]);
}

// ============ السلايدر (مع حماية) ============
var allSliders = document.querySelectorAll('.slider');
for (var s = 0; s < allSliders.length; s++) {
  (function(slider) {
    var slides = slider.querySelector('.slides');
    if (!slides) return;
    
    var images = slides.querySelectorAll('img');
    var totalSlides = images.length;
    if (totalSlides === 0) return;
    
    var currentSlide = 0;
    var startX = 0;
    var isDragging = false;
    
    slider.addEventListener('touchstart', function(e) {
      e.stopPropagation();
      startX = e.touches[0].clientX;
      isDragging = true;
    });
    
    slider.addEventListener('touchmove', function(e) {
      if (!isDragging) return;
      e.stopPropagation();
      var diff = startX - e.touches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) currentSlide = (currentSlide + 1) % totalSlides;
        else currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        slides.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
        isDragging = false;
      }
    });
    
    slider.addEventListener('touchend', function() { isDragging = false; });
    
    var mouseDown = false;
    slider.addEventListener('mousedown', function(e) {
      startX = e.clientX;
      mouseDown = true;
    });
    slider.addEventListener('mouseup', function() { mouseDown = false; });
    slider.addEventListener('mouseleave', function() { mouseDown = false; });
    slider.addEventListener('mousemove', function(e) {
      if (!mouseDown) return;
      var diff = startX - e.clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) currentSlide = (currentSlide + 1) % totalSlides;
        else currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        slides.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
        mouseDown = false;
      }
    });
    
    for (var i = 0; i < images.length; i++) {
      images[i].addEventListener('click', function() {
        currentSlide = (currentSlide + 1) % totalSlides;
        slides.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
      });
    }
  })(allSliders[s]);
}

// ============ 3D Tilt خفيف + Glow ============
var tiltCards = document.querySelectorAll('.card');
for (var i = 0; i < tiltCards.length; i++) {
  (function(card) {
    var glow = card.querySelector('.card-glow');
    var isTouching = false;
    
    // الماوس
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var centerX = rect.width / 2;
      var centerY = rect.height / 2;
      var rotateX = (y - centerY) / 50;
      var rotateY = (centerX - x) / 50;
      
      card.style.transform = 'perspective(1200px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(1.02)';
      
      if (glow) {
        glow.style.left = x + 'px';
        glow.style.top = y + 'px';
        glow.style.opacity = '1';
        glow.style.transform = 'translate(-50%, -50%)';
      }
    });
    
    card.addEventListener('mouseleave', function() {
      card.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) scale(1)';
      if (glow) glow.style.opacity = '0';
    });
    
    // اللمس
    card.addEventListener('touchstart', function() {
      isTouching = true;
      card.style.transition = 'transform 0.1s ease';
      if (glow) glow.style.opacity = '1';
    });
    
    card.addEventListener('touchmove', function(e) {
      if (!isTouching) return;
      var touch = e.touches[0];
      var rect = card.getBoundingClientRect();
      var x = touch.clientX - rect.left;
      var y = touch.clientY - rect.top;
      var centerX = rect.width / 2;
      var centerY = rect.height / 2;
      var rotateX = (y - centerY) / 50;
      var rotateY = (centerX - x) / 50;
      
      card.style.transform = 'perspective(1200px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(1.02)';
      
      if (glow) {
        glow.style.left = x + 'px';
        glow.style.top = y + 'px';
        glow.style.transform = 'translate(-50%, -50%)';
      }
    });
    
    card.addEventListener('touchend', function() {
      isTouching = false;
      card.style.transition = 'transform 0.5s ease';
      card.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) scale(1)';
      if (glow) glow.style.opacity = '0';
    });
  })(tiltCards[i]);
}

// ============ تأثير الموجة ============
var buttons = document.querySelectorAll('.btn');
for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function(e) {
    var rect = this.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    var size = Math.max(rect.width, rect.height);
    
    var ripple = document.createElement('span');
    ripple.classList.add('ripple');
    ripple.style.width = size + 'px';
    ripple.style.height = size + 'px';
    ripple.style.left = (x - size / 2) + 'px';
    ripple.style.top = (y - size / 2) + 'px';
    this.appendChild(ripple);
    
    setTimeout(function() { ripple.remove(); }, 600);
  });
}

// ============ قائمة التواصل ============
function openContactMenu(e) {
  if (e) e.stopPropagation();
  var menu = document.getElementById('contactMenu');
  if (menu) menu.classList.toggle('active');
}

var contactButtons = document.querySelectorAll('.contact-btn');
for (var i = 0; i < contactButtons.length; i++) {
  contactButtons[i].addEventListener('click', openContactMenu);
}

document.addEventListener('click', function(e) {
  var menu = document.getElementById('contactMenu');
  if (menu && menu.classList.contains('active') && !menu.contains(e.target)) {
    menu.classList.remove('active');
  }
});

// ============ القائمة المنسدلة ============
function toggleProfileMenu(e) {
  if (e) e.stopPropagation();
  var dropdown = document.getElementById('profileDropdown');
  if (dropdown) {
    dropdown.classList.toggle('active');
    if (dropdown.classList.contains('active')) updateDropdownInfo();
  }
}

function updateDropdownInfo() {
  var profile = JSON.parse(localStorage.getItem('nokhba_profile') || '{}');
  var nameEl = document.getElementById('dropdownName');
  var emailEl = document.getElementById('dropdownEmail');
  
  if (nameEl) nameEl.textContent = profile.name || 'المستخدم';
  if (emailEl) emailEl.textContent = profile.email || 'user@gmail.com';
  
  if (profile.avatar) {
    var dropdownAvatar = document.getElementById('dropdownAvatar');
    if (dropdownAvatar) dropdownAvatar.innerHTML = '<img src="' + profile.avatar + '" alt="avatar">';
  }
}

function openProfileFromDropdown() {
  document.getElementById('profileDropdown').classList.remove('active');
  openProfile();
}

function openSettingsFromDropdown() {
  document.getElementById('profileDropdown').classList.remove('active');
  openProfile();
  setTimeout(function() {
    var settingsList = document.querySelector('.settings-list');
    if (settingsList) settingsList.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 400);
}

document.addEventListener('click', function(e) {
  var dropdown = document.getElementById('profileDropdown');
  var wrapper = document.querySelector('.profile-menu-wrapper');
  if (dropdown && dropdown.classList.contains('active')) {
    if (wrapper && !wrapper.contains(e.target)) dropdown.classList.remove('active');
  }
});

// ============ الملف الشخصي ============
function loadProfile() {
  var profile = JSON.parse(localStorage.getItem('nokhba_profile') || '{}');
  var nameInput = document.getElementById('profileNameInput');
  var phoneInput = document.getElementById('profilePhoneInput');
  var addressInput = document.getElementById('profileAddressInput');
  var nameDisplay = document.getElementById('profileName');
  var emailDisplay = document.getElementById('profileEmail');
  
  if (nameInput) nameInput.value = profile.name || '';
  if (phoneInput) phoneInput.value = profile.phone || '';
  if (addressInput) addressInput.value = profile.address || '';
  if (nameDisplay) nameDisplay.textContent = profile.name || 'المستخدم';
  if (emailDisplay) emailDisplay.textContent = profile.email || 'user@gmail.com';
  
  if (profile.avatar) updateAvatarDisplay(profile.avatar);
  
  var settings = JSON.parse(localStorage.getItem('nokhba_settings') || '{}');
  var notifToggle = document.getElementById('notificationsToggle');
  var darkToggle = document.getElementById('darkModeToggle');
  var promoToggle = document.getElementById('promotionsToggle');
  
  if (notifToggle) notifToggle.checked = settings.notifications || false;
  if (darkToggle) darkToggle.checked = settings.darkMode || false;
  if (promoToggle) promoToggle.checked = settings.promotions || false;
}

function updateAvatarDisplay(imageUrl) {
  var smallAvatar = document.getElementById('profileAvatar');
  var largeAvatar = document.getElementById('profileAvatarLarge');
  var dropdownAvatar = document.getElementById('dropdownAvatar');
  var imgHTML = '<img src="' + imageUrl + '" alt="avatar">';
  
  if (smallAvatar) smallAvatar.innerHTML = imgHTML;
  if (largeAvatar) largeAvatar.innerHTML = imgHTML;
  if (dropdownAvatar) dropdownAvatar.innerHTML = imgHTML;
}

function uploadAvatar(event) {
  var file = event.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { alert('الصورة كبيرة. الحد 2 ميجا.'); return; }
  
  var reader = new FileReader();
  reader.onload = function(e) {
    var imageUrl = e.target.result;
    var profile = JSON.parse(localStorage.getItem('nokhba_profile') || '{}');
    profile.avatar = imageUrl;
    localStorage.setItem('nokhba_profile', JSON.stringify(profile));
    updateAvatarDisplay(imageUrl);
    if (navigator.vibrate) navigator.vibrate(15);
  };
  reader.readAsDataURL(file);
}

function updateProfile() {
  var nameInput = document.getElementById('profileNameInput');
  var phoneInput = document.getElementById('profilePhoneInput');
  var addressInput = document.getElementById('profileAddressInput');
  var profile = JSON.parse(localStorage.getItem('nokhba_profile') || '{}');
  
  profile.name = nameInput ? nameInput.value : '';
  profile.phone = phoneInput ? phoneInput.value : '';
  profile.address = addressInput ? addressInput.value : '';
  
  localStorage.setItem('nokhba_profile', JSON.stringify(profile));
  
  var nameDisplay = document.getElementById('profileName');
  if (nameDisplay) nameDisplay.textContent = profile.name || 'المستخدم';
}

function saveProfile() {
  updateProfile();
  closeModal('profileModal');
  showToast('تم حفظ التغييرات بنجاح');
  if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
}

function toggleSetting(setting) {
  var settings = JSON.parse(localStorage.getItem('nokhba_settings') || '{}');
  var toggleId = '';
  if (setting === 'notifications') toggleId = 'notificationsToggle';
  if (setting === 'darkMode') toggleId = 'darkModeToggle';
  if (setting === 'promotions') toggleId = 'promotionsToggle';
  
  var toggle = document.getElementById(toggleId);
  if (toggle) {
    settings[setting] = toggle.checked;
    localStorage.setItem('nokhba_settings', JSON.stringify(settings));
    if (setting === 'darkMode') {
      if (toggle.checked) document.body.classList.add('dark-mode');
      else document.body.classList.remove('dark-mode');
    }
    if (navigator.vibrate) navigator.vibrate(10);
  }
}

function showToast(message) {
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(function() { toast.classList.add('show'); }, 100);
  setTimeout(function() {
    toast.classList.remove('show');
    setTimeout(function() { toast.remove(); }, 300);
  }, 2500);
}

// ============ التقييم ============
var ratingStars = document.querySelectorAll('.star');
var ratingAverage = document.querySelector('.rating-average');
var ratingCount = document.querySelector('.rating-count');
var ratingThanks = document.getElementById('ratingThanks');

var ratingsData = { totalRatings: 0, sumRatings: 0, userRating: 0 };

function loadRatings() {
  try {
    var saved = localStorage.getItem('nokhba_ratings');
    if (saved) {
      var parsed = JSON.parse(saved);
      ratingsData.totalRatings = parsed.totalRatings || 0;
      ratingsData.sumRatings = parsed.sumRatings || 0;
      ratingsData.userRating = parsed.userRating || 0;
    }
  } catch(e) {}
  updateRatingDisplay();
}

function saveRatings() {
  try { localStorage.setItem('nokhba_ratings', JSON.stringify(ratingsData)); } catch(e) {}
}

function updateRatingDisplay() {
  var avg = 0;
  if (ratingsData.totalRatings > 0) avg = ratingsData.sumRatings / ratingsData.totalRatings;
  
  if (ratingAverage) ratingAverage.textContent = avg.toFixed(1);
  
  if (ratingCount) {
    var count = ratingsData.totalRatings;
    var label = 'تقييم';
    if (count === 0) label = 'لا يوجد تقييم';
    else if (count === 1) label = 'تقييم واحد';
    else if (count === 2) label = 'تقييمان';
    ratingCount.textContent = '(' + count + ' ' + label + ')';
  }
  
  if (ratingsData.userRating > 0) {
    for (var i = 0; i < ratingStars.length; i++) {
      var val = parseInt(ratingStars[i].getAttribute('data-value'));
      if (val <= ratingsData.userRating) ratingStars[i].classList.add('active');
      else ratingStars[i].classList.remove('active');
    }
  }
}

function setRating(value) {
  if (ratingsData.userRating > 0) {
    ratingsData.sumRatings -= ratingsData.userRating;
    ratingsData.totalRatings -= 1;
  }
  
  ratingsData.userRating = value;
  ratingsData.sumRatings += value;
  ratingsData.totalRatings += 1;
  
  saveRatings();
  updateRatingDisplay();
  
  for (var i = 0; i < ratingStars.length; i++) {
    var val = parseInt(ratingStars[i].getAttribute('data-value'));
    if (val <= value) ratingStars[i].classList.add('active');
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
    var value = parseInt(star.getAttribute('data-value'));
    
    star.addEventListener('mouseenter', function() {
      for (var j = 0; j < ratingStars.length; j++) {
        var v = parseInt(ratingStars[j].getAttribute('data-value'));
        if (v <= value) ratingStars[j].classList.add('hover');
      }
    });
    
    star.addEventListener('mouseleave', function() {
      for (var j = 0; j < ratingStars.length; j++) ratingStars[j].classList.remove('hover');
    });
    
    star.addEventListener('click', function() { setRating(value); });
    
    star.addEventListener('touchstart', function(e) {
      e.preventDefault();
      for (var j = 0; j < ratingStars.length; j++) {
        var v = parseInt(ratingStars[j].getAttribute('data-value'));
        if (v <= value) ratingStars[j].classList.add('hover');
      }
    });
    
    star.addEventListener('touchend', function(e) {
      e.preventDefault();
      for (var j = 0; j < ratingStars.length; j++) ratingStars[j].classList.remove('hover');
      setRating(value);
    });
  })(ratingStars[i]);
}

loadRatings();