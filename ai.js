// ============================================
// 🤖 NAKHEEB AI
// ============================================
var GEMINI_API_KEY = "AQ.Ab8RN6JNzhkWSAE_uE9uqHF9x0wO-WOfVIKf5QkYEYzagNP97Q";

async function aiMakeProfessionalSummary(name, desc, specs) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.length < 20) {
    showToast('⚠️ مفتاح AI مفقود');
    return null;
  }

  var specsText = '';
  if (specs && specs.length) {
    for (var i = 0; i < specs.length; i++) {
      specsText += specs[i].label + ': ' + specs[i].value + '\n';
    }
  }

  var prompt = `أنت خبير مبيعات بأجهزة الطباعة.
اكتب عرض احترافي لجهاز: ${name}
الوصف: ${desc || 'لا يوجد'}
المواصفات: ${specsText || 'لا توجد'}

أرجع JSON فقط بدون أي نص إضافي:
{
  "tagline": "شعار تسويقي بسطر واحد",
  "summary": "ملخص 2-3 أسطر",
  "highlights": ["ميزة 1", "ميزة 2", "ميزة 3"],
  "bestFor": "مناسب لـ ..."
}`;

  // قائمة موديلات - نجرب واحد واحد لين يشتغل
  var models = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-flash-latest',
    'gemini-2.5-flash'
  ];

  for (var m = 0; m < models.length; m++) {
    try {
      var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + models[m] + ':generateContent?key=' + GEMINI_API_KEY;

      var response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
            responseMimeType: "application/json"
          }
        })
      });

      var data = await response.json();

      if (data.error) {
        console.warn('Model ' + models[m] + ' failed:', data.error.message);
        continue;
      }

      if (!data.candidates || !data.candidates[0]) continue;

      var text = data.candidates[0].content.parts[0].text;
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      var parsed = JSON.parse(text);

      if (!parsed.summary || !parsed.highlights) continue;

      console.log('✅ AI worked with model:', models[m]);

      return {
        tagline: parsed.tagline || '',
        summary: parsed.summary || '',
        highlights: parsed.highlights || [],
        bestFor: parsed.bestFor || ''
      };

    } catch (e) {
      console.warn('Model ' + models[m] + ' error:', e.message);
    }
  }

  showToast('⚠️ AI ما اشتغل - رجعنا للعرض العادي');
  return null;
}
