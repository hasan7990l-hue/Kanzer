// ============================================
// 🤖 NAKHEEB AI
// ============================================
var GEMINI_API_KEY = "AIzaSyCFJXoImDeFtzpDPUyVWhSUDF1fj0KoAX0";

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

  var prompt = 'أنت خبير مبيعات بأجهزة الطباعة.\n' +
    'اكتب عرض احترافي لجهاز: ' + name + '\n' +
    'الوصف: ' + (desc || 'لا يوجد') + '\n' +
    'المواصفات: ' + (specsText || 'لا توجد') + '\n\n' +
    'أرجع JSON فقط بدون أي شرح:\n' +
    '{"tagline":"شعار بسطر","summary":"ملخص 2-3 أسطر","highlights":["ميزة 1","ميزة 2","ميزة 3"],"bestFor":"مناسب لـ..."}';

  var models = [
    'gemini-flash-latest',
    'gemini-2.0-flash',
    'gemini-2.5-flash'
  ];

  var lastError = '';

  for (var m = 0; m < models.length; m++) {
    try {
      var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + models[m] + ':generateContent';

      var response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        })
      });

      var data = await response.json();

      // معالجة الأخطاء
      if (data.error) {
        lastError = models[m] + ': ' + data.error.message;
        console.warn('❌ ' + lastError);
        continue;
      }

      if (!data.candidates || !data.candidates[0]) {
        lastError = models[m] + ': no candidates';
        console.warn('❌ ' + lastError);
        continue;
      }

      // استخراج النص من كل الـ parts
      var parts = data.candidates[0].content.parts || [];
      var text = '';
      for (var p = 0; p < parts.length; p++) {
        if (parts[p].thought) continue;
        if (parts[p].text) text += parts[p].text;
      }

      if (!text) {
        lastError = models[m] + ': empty response';
        console.warn('❌ ' + lastError);
        continue;
      }

      // نظّف النص
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

      // استخرج JSON
      var start = text.indexOf('{');
      var end = text.lastIndexOf('}');
      if (start === -1 || end === -1) {
        lastError = models[m] + ': no JSON found';
        console.warn('❌ ' + lastError);
        continue;
      }
      text = text.substring(start, end + 1);

      var parsed;
      try {
        parsed = JSON.parse(text);
      } catch (pe) {
        lastError = models[m] + ': JSON parse failed';
        console.warn('❌ ' + lastError);
        continue;
      }

      if (!parsed.summary || !parsed.highlights) {
        lastError = models[m] + ': missing fields';
        console.warn('❌ ' + lastError);
        continue;
      }

      console.log('✅ AI شغال بـ:', models[m]);

      return {
        tagline: parsed.tagline || '',
        summary: parsed.summary || '',
        highlights: parsed.highlights || [],
        bestFor: parsed.bestFor || ''
      };

    } catch (e) {
      lastError = models[m] + ': ' + e.message;
      console.warn('❌ ' + lastError);
    }
  }

  // كل الموديلات فشلت — نعرض الخطأ للمستخدم
  showToast('⚠️ ' + lastError.substring(0, 80));
  return null;
}
