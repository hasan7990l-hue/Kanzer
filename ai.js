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

أرجع JSON فقط بدون أي نص إضافي أو شرح:
{"tagline":"شعار تسويقي بسطر","summary":"ملخص 2-3 أسطر","highlights":["ميزة 1","ميزة 2","ميزة 3"],"bestFor":"مناسب لـ ..."}`;

  var models = [
    'gemini-flash-latest',
    'gemini-2.5-flash',
    'gemini-2.0-flash'
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
            maxOutputTokens: 1500,
            thinkingConfig: { thinkingBudget: 0 }
          }
        })
      });

      var data = await response.json();

      if (data.error) {
        console.warn('❌ ' + models[m] + ':', data.error.message);
        continue;
      }

      if (!data.candidates || !data.candidates[0]) {
        console.warn('❌ ' + models[m] + ': no candidates');
        continue;
      }

      var parts = data.candidates[0].content.parts;
      var text = '';

      // نجمع كل الـ parts (باستثناء parts التفكير)
      for (var p = 0; p < parts.length; p++) {
        if (parts[p].thought) continue;
        if (parts[p].text) text += parts[p].text;
      }

      if (!text) {
        console.warn('❌ ' + models[m] + ': empty text');
        continue;
      }

      // نظّف النص
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      // إذا فيه نص زايد قبل { أو بعد }
      var start = text.indexOf('{');
      var end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        text = text.substring(start, end + 1);
      }

      var parsed = JSON.parse(text);

      if (!parsed.summary || !parsed.highlights) {
        console.warn('❌ ' + models[m] + ': invalid structure');
        continue;
      }

      console.log('✅ AI شغال بالموديل:', models[m]);

      return {
        tagline: parsed.tagline || '',
        summary: parsed.summary || '',
        highlights: parsed.highlights || [],
        bestFor: parsed.bestFor || ''
      };

    } catch (e) {
      console.warn('❌ ' + models[m] + ':', e.message);
    }
  }

  showToast('⚠️ AI ما اشتغل');
  return null;
}
