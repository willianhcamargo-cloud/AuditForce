import express from "express";
import path from "path";
import nodemailer from "nodemailer";

// Initialize express app
const app = express();
const PORT = 3000;

// Body parser
app.use(express.json());

// API: Mail Status Healthcheck
app.get("/api/mail-status", (req, res) => {
  const hasResend = !!process.env.RESEND_API_KEY;
  const hasSMTP = !!process.env.SMTP_HOST;
  
  res.json({
    configured: hasResend || hasSMTP,
    provider: hasResend ? "Resend" : hasSMTP ? "SMTP" : "Nenhum (Modo Simulação / Ethereal Fallback)",
    sender: hasResend 
      ? (process.env.RESEND_FROM || "AuditForce <noreply@auditforce.com>") 
      : hasSMTP 
        ? (process.env.SMTP_FROM || "AuditForce <noreply@yourdomain.com>") 
        : "sistema@auditforce.local"
  });
});

// API: Send Email
app.post("/api/send-email", async (req, res) => {
  const { to, subject, htmlContent } = req.body;

  if (!to || !subject || !htmlContent) {
    return res.status(400).json({ error: "Parâmetros 'to', 'subject' e 'htmlContent' são obrigatórios." });
  }

  // 1. Check Resend API integration
  if (process.env.RESEND_API_KEY) {
    try {
      const from = process.env.RESEND_FROM || "AuditForce <noreply@auditforce.com>";
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          html: htmlContent
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro na API do Resend");
      }

      console.log(`[Resend] E-mail real enviado para ${to} com sucesso.`);
      return res.json({ success: true, provider: "Resend" });
    } catch (error: any) {
      console.error("[Resend Error]:", error);
      return res.status(500).json({ error: `Erro ao enviar via Resend: ${error.message}` });
    }
  }

  // 2. Check SMTP Server integration
  if (process.env.SMTP_HOST) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const from = process.env.SMTP_FROM || "AuditForce <noreply@yourdomain.com>";
      await transporter.sendMail({
        from,
        to,
        subject,
        html: htmlContent
      });

      console.log(`[SMTP] E-mail real enviado para ${to} com sucesso.`);
      return res.json({ success: true, provider: "SMTP" });
    } catch (error: any) {
      console.error("[SMTP Error]:", error);
      return res.status(500).json({ error: `Erro ao enviar via SMTP: ${error.message}` });
    }
  }

  // 3. Fallback: Ethereal Email test account (creates a real test message box on-the-fly)
  try {
    console.log("[Mail Fallback] Nenhuma credencial SMTP/Resend configurada. Gerando conta de teste Ethereal...");
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    const info = await testTransporter.sendMail({
      from: "AuditForce <sistema@auditforce.local>",
      to,
      subject,
      html: htmlContent
    });

    const testUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[Ethereal Fallback] E-mail simulado enviado para ${to}`);
    console.log(`[Ethereal Fallback] Veja a caixa de entrada real em: ${testUrl}`);

    return res.json({
      success: true,
      provider: "Ethereal Test Account",
      testUrl,
      message: "E-mail enviado via conta de testes temporária."
    });
  } catch (error: any) {
    console.error("[Fallback Error]:", error);
    return res.json({
      success: false,
      provider: "None",
      error: error.message,
      message: "Falha na entrega de teste."
    });
  }
});

// Start server and handle Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
