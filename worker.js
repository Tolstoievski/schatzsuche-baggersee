/* =====================================================================
   Der Schatz des Seehüters — Brevo-Worker (Cloudflare)
   ---------------------------------------------------------------------
   Diese kleine "Rezeption" ist das EINZIGE, das den Brevo-Schlüssel kennt.
   Sie läuft bei Cloudflare – sie ist NICHT Teil der Website.

   Erwartet einen POST mit JSON:
     { childName, email, wantsCertificate, wantsNewsletter }

   Variablen (in Cloudflare unter Settings → Variables setzen):
     BREVO_API_KEY          (Secret)  – API-Schlüssel aus Brevo
     BREVO_LIST_ID          (Text)    – ID der deutschen Newsletter-Liste
     BREVO_DOI_TEMPLATE_ID  (Text)    – ID der Double-Opt-In-Bestätigungsmail
     SENDER_EMAIL           (Text)    – z. B. hallo@abenteuerbayern.de
     SENDER_NAME            (Text)    – z. B. AbenteuerBayern
     SITE_URL               (Text)    – Basis-URL der Schatzsuche
                                        (z. B. https://USER.github.io/baggersee)
     DOI_REDIRECT_URL       (Text)    – "Danke"-Seite nach Bestätigung

   Ausserdem nötig: eine KV-Namespace-Bindung mit Namen COUNTER
   (für den dauerhaften Zähler der ausgestellten Urkunden).
   ===================================================================== */

// Für mehr Sicherheit kann "*" später durch die echte Website-Domain ersetzt werden.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (request.method !== "POST") return json({ error: "Nur POST erlaubt." }, 405);

    let data;
    try {
      data = await request.json();
    } catch {
      return json({ error: "Ungültige Anfrage." }, 400);
    }

    const childName = (data.childName || "").toString().trim().slice(0, 60);
    const email = (data.email || "").toString().trim().slice(0, 120);
    const wantsCertificate = data.wantsCertificate === true;
    const wantsNewsletter = data.wantsNewsletter === true;

    if (!email || !email.includes("@")) return json({ error: "Ungültige E-Mail." }, 400);
    if (!wantsCertificate && !wantsNewsletter) return json({ error: "Keine Option gewählt." }, 400);

    let count = null;

    try {
      /* 1) URKUNDE — transaktional, KEINE Speicherung als Marketing-Kontakt */
      if (wantsCertificate) {
        // Dauerhafter Zähler + laufende Urkundennummer
        count = parseInt((await env.COUNTER.get("urkunden_total")) || "0", 10) + 1;
        await env.COUNTER.put("urkunden_total", String(count));

        const year = new Date().getFullYear();
        const certNr = "SD-" + year + "-" + String(count).padStart(3, "0");

        const link = env.SITE_URL.replace(/\/+$/, "") +
          "/urkunde.html?name=" + encodeURIComponent(childName) +
          "&nr=" + encodeURIComponent(certNr);

        await sendCertificateEmail(env, email, childName, link);
      }

      /* 2) NEWSLETTER — Double-Opt-In (Brevo verschickt die Bestätigungsmail) */
      if (wantsNewsletter) {
        await sendDoubleOptIn(env, email);
      }
    } catch (err) {
      return json({ error: "Versand fehlgeschlagen.", detail: String(err) }, 502);
    }

    return json({ ok: true, count });
  }
};

/* ---- Transaktionale Urkunden-Mail (Inhalt liegt hier, bewusst OHNE Werbung) ---- */
async function sendCertificateEmail(env, email, childName, link) {
  const safeName = escapeHtml(childName);
  const html = `
    <div style="font-family:Georgia,serif;max-width:520px;margin:auto;color:#2f1b0c;">
      <h2>&#127988;&#65039; Eure Ehrenurkunde ist da!</h2>
      <p>Ahoi${safeName ? " " + safeName : ""}!</p>
      <p>Ihr habt den Schatz des Seehüters gehoben und alle Prüfungen bestanden.
         Tippt auf den Button, um eure persönliche Urkunde zu öffnen, zu speichern
         oder auszudrucken:</p>
      <p style="text-align:center;margin:28px 0;">
        <a href="${link}" style="background:#ffb703;color:#2f1b0c;text-decoration:none;
           padding:14px 26px;border-radius:10px;font-size:18px;font-weight:bold;
           display:inline-block;">&#128220; Zur Urkunde</a>
      </p>
      <p style="font-size:13px;color:#777;">Falls der Button nicht reagiert, kopiert
         diesen Link in euren Browser:<br>${link}</p>
    </div>`;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": env.BREVO_API_KEY,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      sender: { email: env.SENDER_EMAIL, name: env.SENDER_NAME },
      to: [{ email }],
      subject: "🏴‍☠️ Eure Ehrenurkunde – Der Schatz des Seehüters",
      htmlContent: html,
      tags: ["urkunde-baggersee"] // <- damit der Versand in Brevo filter-/zählbar ist
    })
  });

  if (!res.ok) throw new Error("Brevo-Urkundenmail: " + res.status + " " + (await res.text()));
}

/* ---- Newsletter Double-Opt-In ---- */
async function sendDoubleOptIn(env, email) {
  const res = await fetch("https://api.brevo.com/v3/contacts/doubleOptinConfirmation", {
    method: "POST",
    headers: {
      "api-key": env.BREVO_API_KEY,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      email,
      includeListIds: [parseInt(env.BREVO_LIST_ID, 10)],
      templateId: parseInt(env.BREVO_DOI_TEMPLATE_ID, 10),
      redirectionUrl: env.DOI_REDIRECT_URL
    })
  });

  if (!res.ok) throw new Error("Brevo-DOI: " + res.status + " " + (await res.text()));
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...CORS }
  });
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
