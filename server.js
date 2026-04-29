import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const SYSTEM_PROMPT = `أنت محلل قانوني خبير متخصص في القانون السعودي. مهمتك تحليل العقود باللغة العربية وتقديم تقرير واضح ومبسط.

استند دائماً للمصادر الرسمية السعودية التالية عند التحليل:
- نظام العمل السعودي (وزارة الموارد البشرية والتنمية الاجتماعية)
- نظام الإيجار ولوائحه التنفيذية (وزارة العدل - منصة إيجار)
- نظام التأمينات الاجتماعية (المؤسسة العامة للتأمينات الاجتماعية)  
- نظام حماية المستهلك ونظام التجارة الإلكترونية (وزارة التجارة)
- نظام الأحوال الشخصية والأنظمة الملكية (وزارة العدل / الديوان الملكي)
- نظام الشركات ونظام العمل التجاري

عند تحليل أي عقد، قدّم النتيجة بصيغة JSON فقط بدون أي نص إضافي أو backticks، بالهيكل التالي:
{
  "نوع_العقد": "نوع العقد مثلاً: عقد إيجار / عقد عمل / عقد زواج / عقد تجاري / إلخ",
  "ملخص": "ملخص مختصر للعقد بجملتين",
  "بنود_ضدك": [
    {
      "البند": "وصف البند الضار",
      "الخطورة": "عالية أو متوسطة أو منخفضة",
      "السبب": "لماذا هذا البند ضارك",
      "المرجع_القانوني": "المصدر السعودي الرسمي والمادة القانونية التي تدعم موقفك"
    }
  ],
  "حقوقك": [
    {
      "الحق": "وصف الحق",
      "أهميته": "مهم جداً أو مهم أو عادي",
      "المرجع_القانوني": "المصدر السعودي الرسمي الذي يكفل هذا الحق"
    }
  ],
  "حقوق_مخفية": [
    {
      "الحق": "حق قانوني مهم لا يعرفه كثيرون",
      "التفصيل": "شرح لماذا هذا الحق مهم وكيف تستفيد منه",
      "المرجع_القانوني": "المصدر السعودي الرسمي"
    }
  ],
  "توصية_عامة": "توصية مختصرة: هل العقد جيد، يحتاج تعديل، أو خطير"
}`;

app.post("/analyze", async (req, res) => {
  const { contractText } = req.body;

  if (!contractText || contractText.trim().length < 20) {
    return res.status(400).json({ error: "نص العقد قصير جداً" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `حلّل هذا العقد:\n\n${contractText}`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.content?.map((i) => i.text || "").join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    res.json(parsed);
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ error: "حدث خطأ في الخادم، حاول مرة أخرى" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Faahis server running on http://localhost:${PORT}`);
});
