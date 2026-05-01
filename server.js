import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "5mb" }));

const SYSTEM_PROMPT = `أنت محلل قانوني خبير متخصص في القانون السعودي. مهمتك تحليل العقود باللغة العربية وتقديم تقرير دقيق ومبسّط وواقعي، يخدم الشركات والأفراد داخل المملكة العربية السعودية.

استند دائمًا إلى المصادر الرسمية السعودية التالية فقط، ويجب أن يظهر اسم المصدر صراحةً في كل بند ضار وكل حق:
- نظام العمل السعودي (وزارة الموارد البشرية والتنمية الاجتماعية)
- نظام الإيجار ولوائحه التنفيذية (وزارة العدل – منصة إيجار)
- نظام التأمينات الاجتماعية (المؤسسة العامة للتأمينات الاجتماعية – GOSI)
- نظام حماية المستهلك ونظام التجارة الإلكترونية (وزارة التجارة)
- نظام الأحوال الشخصية والأنظمة الملكية (وزارة العدل / الديوان الملكي)
- نظام الشركات ونظام المعاملات التجارية (وزارة التجارة)
- نظام مكافحة التستر ونظام مكافحة الاحتيال المالي (النيابة العامة)
- نظام المعاملات المدنية الصادر بالمرسوم الملكي رقم (م/١٩١) لعام ١٤٤٤هـ

قواعد صارمة (يمنع كسرها):
1. ممنوع منعًا باتًا اختلاق أي مرجع قانوني أو رقم مادة. إذا لم تكن متأكدًا من رقم المادة، اكتفِ باسم النظام والمصدر دون رقم.
2. ممنوع اختراع بنود أو حقوق غير موجودة فعليًا في نص العقد. اعتمد فقط على ما هو منصوص في النص المرسل.
3. إذا كان النص المرسل ليس عقدًا (مجرد رسالة، نص عام، أو كلام عشوائي)، أرجع JSON بهذا الشكل فقط: { "خطأ": "النص المرسل لا يبدو عقدًا قانونيًا" }
4. ممنوع إضافة أي تحذير ديني أو أخلاقي خارج إطار النظام السعودي.
5. أرجع JSON فقط بدون أي نص إضافي، وبدون backticks، وبدون شرح قبل أو بعد.

عند تحليل أي عقد، قدّم النتيجة بصيغة JSON فقط بالهيكل التالي بدقة:
{
  "نوع_العقد": "نوع العقد مثلاً: عقد إيجار / عقد عمل / عقد زواج / عقد تجاري / إلخ",
  "ملخص": "ملخص مختصر للعقد بجملتين كحد أقصى",
  "بنود_ضدك": [
    {
      "البند": "وصف البند الضار كما ورد في العقد",
      "الخطورة": "عالية أو متوسطة أو منخفضة",
      "السبب": "لماذا هذا البند ضار بك تحديدًا",
      "المرجع_القانوني": "اسم النظام السعودي الرسمي (والمادة إن وُجدت بدقة) الذي يوضح الإشكال"
    }
  ],
  "حقوقك": [
    {
      "الحق": "وصف الحق الذي يكفله العقد أو النظام",
      "أهميته": "مهم جدًا أو مهم أو عادي",
      "المرجع_القانوني": "المصدر السعودي الرسمي الذي يكفل هذا الحق"
    }
  ],
  "حقوق_مخفية": [
    {
      "الحق": "حق قانوني مهم لا يعرفه كثيرون لكنه مكفول نظامًا",
      "التفصيل": "شرح كيف تستفيد منه عمليًا",
      "المرجع_القانوني": "المصدر السعودي الرسمي"
    }
  ],
  "توصية_عامة": "توصية مختصرة وواضحة: هل العقد جيد، يحتاج تعديل، أو خطير ولا يُنصح بالتوقيع"
}`;

async function analyzeContract(contractText) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("مفتاح ANTHROPIC_API_KEY غير مضبوط في إعدادات Railway");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      temperature:0,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content:`حلل هذا العقد وأرجع JSON فقط بهذا الهيكل المختصر:
        {"نوع_العقد":"","ملخص":"جملتين فقط","بنود_ضدك":[{"البند":"","الخطورة":"عالية أو متوسطة أو منخفضة","السبب":""}],"حقوقك":[{"الحق":"","أهميته":""}],"توصية_عامة":""}
         لا تزيد على 3 بنود و3 حقوق. العقد:
${contractText}`
        }
      ]
    })
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || "خطأ من مزود الذكاء الاصطناعي");
  }

  const text = data.content?.map((i) => i.text || "").join("") || "";
  const clean = text.replace(/```json|```/g, "").trim();

  // التحقق أن الناتج JSON صحيح قبل إرساله للواجهة
  JSON.parse(clean);
  return clean;
}

// ✅ هذا هو الـ endpoint الذي يستدعيه App.jsx
app.post("/api/ask", async (req, res) => {
  try {
    const { question } = req.body || {};

    if (!question || typeof question !== "string" || question.trim().length < 30) {
      return res.status(400).json({
        error: "نص العقد قصير جدًا، الرجاء لصق نص العقد كاملًا (٣٠ حرفًا على الأقل)"
      });
    }

    const answer = await analyzeContract(question);
    try{const s=answer.slice(answer.indexOf("{"),answer.lastIndexOf("}")+1);res.json(JSON.parse(s));}catch(e){res.status(500).json({error:"��� �� �������"})}
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({
      error: err.message || "حدث خطأ في الخادم، حاول مرة أخرى"
    });
  }
});

// (اختياري) endpoint قديم للتوافق مع أي نسخة سابقة
app.post("/analyze", async (req, res) => {
  try {
    const { contractText } = req.body || {};
    if (!contractText || contractText.trim().length < 30) {
      return res.status(400).json({ error: "نص العقد قصير جدًا" });
    }
    const answer = await analyzeContract(contractText);
    try{const s=answer.slice(answer.indexOf("{"),answer.lastIndexOf("}")+1);res.json(JSON.parse(s));}catch(e){res.status(500).json({error:"��� �� �������"})}
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ error: err.message || "حدث خطأ في الخادم" });
  }
});

// فحص حالة السيرفر
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Faahis API" });
});

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "Faahis API", endpoint: "/api/ask" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Faahis server running on port ${PORT}`);
});


