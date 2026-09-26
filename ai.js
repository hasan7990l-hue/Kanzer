// ============================================
// 🤖 NAKHEEB AI - Groq
// ============================================
var GROQ_API_KEY = "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";

async function aiMakeProfessionalSummary(name, desc, specs) {
  if (!GROQ_API_KEY || GROQ_API_KEY.length < 20) {
    showToast('⚠️ مفتاح AI مفقود');
    return null;
  }

  var specsText = '';
  if (specs && specs.length) {
    for (var i = 0; i < specs.length; i++) {
      specsText += specs[i].label + ': ' + specs[i].value + '\n';
    }
  }

  var prompt = 'أنت خبير مبيعات بأجهزة الطباعة والاستنساخ.\n' +
    'اكتب عرض تقديمي احترافي لجهاز: ' + name + '\n' +
    'الوصف: ' + (desc || 'لا يوجد') + '\n' +
    'المواصفات:\n' + (specsText || 'لا توجد') + '\n\n' +
    'أرجع JSON فقط بدون أي شرح أو نص إضافي، بهذا الشكل بالضبط:\n' +
    '{"tagline":"شعار تسويقي بسطر واحد","summary":"ملخص احترافي 2-3 أسطر","highlights":["ميزة 1","ميزة 2","ميزة 3","ميزة 4"],"bestFor":"مناسب لـ ..."}\n\n' +
    'شروط:\n' +
    '- عربية فصحى احترافية\n' +
    '- 3-4 نقاط في highlights\n' +
    '- إذا الجهاز غير معروف، اعتمد على الاسم';

  try {
    var response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + GROQ_API_KEY
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content: 'أنت مساعد يرد فقط بـ JSON صالح بدون أي شرح. لا تكتب ```json ولا ```.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      })
    });

    var data = await response.json();

    if (data.error) {
      console.error('Groq error:', data.error.message);
      showToast('⚠️ ' + data.error.message.substring(0, 60));
      return null;
    }

    if (!data.choices || !data.choices[0]) {
      showToast('⚠️ رد غير متوقع من AI');
      return null;
    }

    var text = data.choices[0].message.content;
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    var parsed = JSON.parse(text);

    if (!parsed.summary || !parsed.highlights) {
      showToast('⚠️ الرد ناقص');
      return null;
    }

    console.log('✅ Groq AI شغال');

    return {
      tagline: parsed.tagline || '',
      summary: parsed.summary || '',
      highlights: parsed.highlights || [],
      bestFor: parsed.bestFor || ''
    };

  } catch (e) {
    console.error('AI failed:', e);
    showToast('⚠️ خطأ: ' + e.message.substring(0, 60));
    return null;
  }
}
