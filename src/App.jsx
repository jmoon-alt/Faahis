import { useState, useRef } from "react";

const RAILWAY_URL = "https://faahis-production.up.railway.app";

const getRiskColor = (level) => {
  if (level === "عالية") return "#FF4545";
  if (level === "متوسطة") return "#FFB800";
  return "#00C48C";
};

const getImportanceColor = (level) => {
  if (level === "مهم جدًا") return "#00C48C";
  if (level === "مهم") return "#4D9FFF";
  return "#888";
};

export default function Faahis() {
  const [contractText, setContractText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setContractText(ev.target.result);
    reader.readAsText(file, "UTF-8");
  };

  const analyze = async () => {
    if (!contractText.trim()) {
      setError("الرجاء إدخال نص العقد أو رفع ملف");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${RAILWAY_URL}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: contractText })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "حدث خطأ أثناء التحليل");
      }

      setResult(JSON.parse(data.answer));
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء التحليل، حاول مرة ثانية");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setContractText("");
    setFileName("");
    setError("");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0F",
      fontFamily: "'Tajawal', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      direction: "rtl",
      color: "#F0EDE8",
      padding: "0"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        padding: "48px 32px 32px",
        textAlign: "center",
        borderBottom: "1px solid #1E1E2A",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "radial-gradient(ellipse at 50% -20%, #1A1030 0%, transparent 70%)",
          pointerEvents: "none"
        }} />
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "10px",
          background: "#13111A", border: "1px solid #2A2040",
          borderRadius: "100px", padding: "6px 18px", marginBottom: "24px",
          fontSize: "13px", color: "#9B8FCC"
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#7B5FCC", display: "inline-block", animation: "pulse 2s infinite" }} />
          مدعوم بالذكاء الاصطناعي
        </div>
        <h1 style={{
          fontSize: "clamp(48px, 10vw, 72px)",
          fontWeight: 900,
          margin: "0 0 8px",
          letterSpacing: "-2px",
          background: "linear-gradient(135deg, #F0EDE8 30%, #7B5FCC)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>فاحص</h1>
        <p style={{ color: "#6B6880", fontSize: "16px", margin: 0, fontWeight: 300 }}>
          ارفع أي عقد، نحلله لك في ثوانٍ
        </p>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>
        {!result ? (
          <>
            {/* Upload Zone */}
            <div
              onClick={() => fileRef.current.click()}
              style={{
                border: "1.5px dashed #2A2040",
                borderRadius: "16px",
                padding: "32px",
                textAlign: "center",
                cursor: "pointer",
                marginBottom: "16px",
                background: "#0E0C15",
                transition: "border-color 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#7B5FCC"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#2A2040"}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📄</div>
              <p style={{ margin: 0, color: "#6B6880", fontSize: "14px" }}>
                {fileName ? <span style={{ color: "#9B8FCC" }}>{fileName}</span> : "انقر لرفع ملف نصي (.txt)"}
              </p>
              <input ref={fileRef} type="file" accept=".txt" onChange={handleFile} style={{ display: "none" }} />
            </div>

            <div style={{ textAlign: "center", color: "#3A3648", margin: "12px 0", fontSize: "13px" }}>أو</div>

            {/* Text Area */}
            <textarea
              value={contractText}
              onChange={e => setContractText(e.target.value)}
              placeholder="الصق نص العقد هنا مباشرة..."
              style={{
                width: "100%",
                minHeight: "200px",
                background: "#0E0C15",
                border: "1.5px solid #1E1E2A",
                borderRadius: "16px",
                padding: "20px",
                color: "#F0EDE8",
                fontSize: "15px",
                fontFamily: "inherit",
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
                lineHeight: 1.8
              }}
              onFocus={e => e.target.style.borderColor = "#7B5FCC"}
              onBlur={e => e.target.style.borderColor = "#1E1E2A"}
            />

            {error && (
              <p style={{ color: "#FF4545", fontSize: "14px", margin: "8px 0 0", textAlign: "center" }}>{error}</p>
            )}

            {/* Analyze Button */}
            <button
              onClick={analyze}
              disabled={loading}
              style={{
                width: "100%",
                marginTop: "20px",
                padding: "18px",
                background: loading ? "#1E1E2A" : "linear-gradient(135deg, #5B3FCC, #7B5FCC)",
                border: "none",
                borderRadius: "14px",
                color: "#fff",
                fontSize: "17px",
                fontWeight: 700,
                fontFamily: "inherit",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "opacity 0.2s",
                letterSpacing: "0.5px"
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                  <span style={{
                    width: 18, height: 18, border: "2px solid #4A4060",
                    borderTopColor: "#9B8FCC", borderRadius: "50%",
                    display: "inline-block", animation: "spin 0.8s linear infinite"
                  }} />
                  جاري التحليل...
                </span>
              ) : "حلّل العقد"}
            </button>
          </>
        ) : (
          /* Results */
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            {/* Contract Type Badge */}
            <div style={{
              background: "#13111A", border: "1px solid #2A2040",
              borderRadius: "12px", padding: "16px 20px",
              marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <div style={{ fontSize: "11px", color: "#6B6880", marginBottom: "4px" }}>نوع العقد</div>
                <div style={{ fontWeight: 700, fontSize: "18px" }}>{result["نوع_العقد"]}</div>
              </div>
              <span style={{ fontSize: "28px" }}>📑</span>
            </div>

            {/* Summary */}
            <div style={{
              background: "#13111A", border: "1px solid #2A2040",
              borderRadius: "12px", padding: "16px 20px", marginBottom: "16px"
            }}>
              <div style={{ fontSize: "11px", color: "#6B6880", marginBottom: "8px" }}>الملخص</div>
              <p style={{ margin: 0, lineHeight: 1.8, color: "#C8C4D4" }}>{result["ملخص"]}</p>
            </div>

            {/* Against You */}
            {result["بنود_ضدك"]?.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "13px", color: "#FF4545", marginBottom: "10px", fontWeight: 700 }}>
                  بنود تضرك ({result["بنود_ضدك"].length})
                </div>
                {result["بنود_ضدك"].map((b, i) => (
                  <div key={i} style={{
                    background: "#13111A", border: `1px solid ${getRiskColor(b["الخطورة"])}22`,
                    borderRight: `3px solid ${getRiskColor(b["الخطورة"])}`,
                    borderRadius: "12px", padding: "14px 16px", marginBottom: "8px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontWeight: 600, fontSize: "15px" }}>{b["البند"]}</span>
                      <span style={{
                        fontSize: "11px", padding: "3px 10px", borderRadius: "100px",
                        background: `${getRiskColor(b["الخطورة"])}22`,
                        color: getRiskColor(b["الخطورة"]),
                        whiteSpace: "nowrap", marginRight: "8px"
                      }}>{b["الخطورة"]}</span>
                    </div>
                    <p style={{ margin: 0, color: "#6B6880", fontSize: "13px", lineHeight: 1.7 }}>{b["السبب"]}</p>
                    {b["المرجع_القانوني"] && (
                      <p style={{ margin: "8px 0 0", color: "#7B5FCC", fontSize: "12px", lineHeight: 1.7 }}>
                        📚 المرجع: {b["المرجع_القانوني"]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Your Rights */}
            {result["حقوقك"]?.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "13px", color: "#00C48C", marginBottom: "10px", fontWeight: 700 }}>
                  حقوقك في هذا العقد ({result["حقوقك"].length})
                </div>
                {result["حقوقك"].map((h, i) => (
                  <div key={i} style={{
                    background: "#13111A", border: `1px solid ${getImportanceColor(h["أهميته"])}22`,
                    borderRight: `3px solid ${getImportanceColor(h["أهميته"])}`,
                    borderRadius: "12px", padding: "14px 16px", marginBottom: "8px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "15px" }}>{h["الحق"]}</span>
                      <span style={{
                        fontSize: "11px", padding: "3px 10px", borderRadius: "100px",
                        background: `${getImportanceColor(h["أهميته"])}22`,
                        color: getImportanceColor(h["أهميته"]),
                        whiteSpace: "nowrap", marginRight: "8px"
                      }}>{h["أهميته"]}</span>
                    </div>
                    {h["المرجع_القانوني"] && (
                      <p style={{ margin: "8px 0 0", color: "#7B5FCC", fontSize: "12px", lineHeight: 1.7 }}>
                        📚 المرجع: {h["المرجع_القانوني"]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Hidden Rights */}
            {result["حقوق_مخفية"]?.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "13px", color: "#9B8FCC", marginBottom: "10px", fontWeight: 700 }}>
                  حقوق قد لا تعرفها ({result["حقوق_مخفية"].length})
                </div>
                {result["حقوق_مخفية"].map((h, i) => (
                  <div key={i} style={{
                    background: "#13111A", border: "1px solid #2A2040",
                    borderRight: "3px solid #7B5FCC",
                    borderRadius: "12px", padding: "14px 16px", marginBottom: "8px"
                  }}>
                    <div style={{ fontWeight: 600, fontSize: "15px", marginBottom: "6px" }}>{h["الحق"]}</div>
                    <p style={{ margin: 0, color: "#6B6880", fontSize: "13px", lineHeight: 1.7 }}>{h["التفصيل"]}</p>
                    {h["المرجع_القانوني"] && (
                      <p style={{ margin: "8px 0 0", color: "#7B5FCC", fontSize: "12px", lineHeight: 1.7 }}>
                        📚 المرجع: {h["المرجع_القانوني"]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Recommendation */}
            <div style={{
              background: "linear-gradient(135deg, #1A1030, #13111A)",
              border: "1px solid #2A2040", borderRadius: "12px",
              padding: "20px", marginBottom: "24px"
            }}>
              <div style={{ fontSize: "11px", color: "#6B6880", marginBottom: "8px" }}>التوصية العامة</div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: "16px", lineHeight: 1.7, color: "#C8C4D4" }}>
                {result["توصية_عامة"]}
              </p>
            </div>

            {/* Disclaimer */}
            <p style={{ fontSize: "11px", color: "#3A3648", textAlign: "center", marginBottom: "20px", lineHeight: 1.7 }}>
              هذا التحليل للاسترشاد فقط وليس استشارة قانونية معتمدة. للقضايا الجوهرية يُنصح بمراجعة محامٍ مرخص.
            </p>

            <button onClick={reset} style={{
              width: "100%", padding: "16px",
              background: "transparent", border: "1.5px solid #2A2040",
              borderRadius: "14px", color: "#9B8FCC", fontSize: "15px",
              fontFamily: "inherit", cursor: "pointer", fontWeight: 600
            }}>
              + تحليل عقد جديد
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        textarea::placeholder { color: #3A3648; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0A0A0F; }
        ::-webkit-scrollbar-thumb { background: #2A2040; border-radius: 3px; }
      `}</style>
    </div>
  );
}
