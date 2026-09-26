// ============================================
// 🤖 NAKHEEB AI - توليد ملخص احترافي للمنتجات
// ============================================

var GEMINI_API_KEY = "AQ.Ab8RN6IO5u1olTJY2Omv-New3zIe0uOZr-TXRt5ay9ob-IWOIQ";

async function aiMakeProfessionalSummary(name, desc, specs) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.length < 20) {
    console.warn('⚠️ Gemini API key missing');
    return null;
  }

  var specsText = '';
  if (specs && specs.length) {
    for (var i = 0; i < specs.length; i++) {
      specsText += specs[i].label + ': ' + specs[i].value + '\n';
    }
  }

  var prompt = `أنت خبير مبيعات محترف بأجهزة الطباعة والاستنساخ.
اكتب عرض تقديمي احترافي لجهاز: ${name}

معلومات متوفرة:
- الوصف: ${desc || 'لا يوجد'}
- المواصفات:
${specsText || 'لا توجد'}

أرجع JSON فقط بهذا الشكل بالضبط (بدون أي نص إضافي):
{
  "tagline": "شعار تسويقي جذاب بسطر واحد",
  "summary": "ملخص احترافي 2-3 أسطر يقنع الزبون",
  "highlights": ["ميزة 1", "ميزة 2", "ميزة 3", "ميزة 4"],
  "bestFor": "مناسب لـ ... (سطر واحد)"
}

شروط:
- عربية فصحى احترافية بدون كلام مبالغ فيه
- ركّز على الفوائد العملية للزبون
- أرقام حقيقية إذا توفرت
- 3-4 نقاط فقط في highlights`;

  try {
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_API_KEY;

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
      console.error('Gemini error:', data.error.message);
      return null;
    }

    if (!data.candidates || !data.candidates[0]) {
      console.error('No candidates in response');
      return null;
    }

    var text = data.candidates[0].content.parts[0].text;
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    var parsed = JSON.parse(text);

    if (!parsed.summary || !parsed.highlights) {
      console.warn('Invalid AI response structure');
      return null;
    }

    return {
      tagline: parsed.tagline || '',
      summary: parsed.summary || '',
      highlights: parsed.highlights || [],
      bestFor: parsed.bestFor || ''
    };

  } catch (e) {
    console.error('AI summary failed:', e);
    return null;
  }
    }
