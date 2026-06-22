# Brevo-Einrichtung — Der Schatz des Seehüters

Diese Anleitung verbindet die Schatzsuche mit **Brevo** (Newsletter-Anmeldung
mit Double-Opt-In) und dem **Cloudflare-Worker** (verschickt die Urkunde + zählt sie).

Am Ende brauchst du **vier Werte aus Brevo**, die in den Worker kommen:
**① API-Schlüssel · ② Listen-ID · ③ DOI-Template-ID · ④ Absenderadresse.**

---

## Teil A — Brevo-Konto

1. Konto erstellen auf <https://www.brevo.com> (kostenloser Plan reicht zum Start).
2. **Auftragsverarbeitungsvertrag (AVV/DPA) annehmen** — in der EU Pflicht.
   In Brevo unter *Einstellungen → Datenschutz / DPA* bestätigen.

## Teil B — Absender verifizieren (gute Zustellbarkeit)

3. *Einstellungen → Absender, Domains & dedizierte IPs → Domains*.
4. Domain **abenteuerbayern.de** hinzufügen. Brevo zeigt dir ein paar
   DNS-Einträge (SPF, DKIM, ggf. DMARC).
5. Diese Einträge dort eintragen, wo die Domain verwaltet wird.
   → Website liegt bei **Sitejet**, E-Mail bei **IONOS** → die DNS-Verwaltung ist
   sehr wahrscheinlich bei **IONOS** (IONOS-Konto → *Domains → DNS*). Sonst dort,
   wo die Domain registriert ist.
6. Warten, bis Brevo die Domain als **verifiziert** zeigt (kann Stunden dauern).
   → **④ Absenderadresse** notieren, z. B. `hallo@abenteuerbayern.de`

## Teil C — Liste + Double-Opt-In

7. *Kontakte → Listen → Liste erstellen*, z. B. „Newsletter – Familien Bayern".
   → **② Listen-ID** notieren (Zahl neben der Liste).
8. *Kontakte → Formulare* bzw. *Automationen → Double Opt-In* →
   **Bestätigungs-E-Mail (DOI)** anlegen: kurzer Text „Bitte bestätige deine
   Anmeldung" + Bestätigungs-Button.
   → **③ Template-ID** dieser Mail notieren.
9. **„Danke"-Seite** festlegen, auf die der Bestätigungslink führt
   (einfache Seite auf abenteuerbayern.de oder eine Brevo-Seite).

## Teil D — API-Schlüssel

10. *Einstellungen → SMTP & API → API-Schlüssel → Neuen Schlüssel erstellen*.
    → **① API-Schlüssel** kopieren.
    ⚠️ Kommt **nur** in den Worker (Teil E) — **niemals** in die Website.

---

## Teil E — Cloudflare-Worker bereitstellen

11. Kostenloses Konto auf <https://dash.cloudflare.com>.
12. *Workers & Pages → Create → Worker*. Namen vergeben → „Deploy".
13. *Edit code* → den kompletten Inhalt von **`worker.js`** einfügen → „Deploy".
14. **KV-Speicher für den Zähler:** *Storage & Databases → KV → Create namespace*,
    z. B. `seehueter`. Dann beim Worker *Settings → Bindings → Add → KV namespace*:
    Variablenname **`COUNTER`**, Namespace = `seehueter`.
15. **Variablen & Secrets** beim Worker setzen (*Settings → Variables*):

    | Name | Typ | Wert |
    |------|-----|------|
    | `BREVO_API_KEY` | Secret | ① |
    | `BREVO_LIST_ID` | Text | ② |
    | `BREVO_DOI_TEMPLATE_ID` | Text | ③ |
    | `SENDER_EMAIL` | Text | ④ |
    | `SENDER_NAME` | Text | AbenteuerBayern |
    | `SITE_URL` | Text | URL der Schatzsuche (z. B. `https://…github.io/…`) |
    | `DOI_REDIRECT_URL` | Text | deine „Danke"-Seite |

16. Die **Worker-URL** kopieren (z. B. `https://seehueter.DEINNAME.workers.dev`).

## Teil F — Website verbinden

17. In **`urkunde-generator.html`** unten im Skript die Zeile
    `const WORKER_URL = "…";` durch deine echte Worker-URL ersetzen.
18. `urkunde-generator.html` und `urkunde.html` (samt Bildern) hochladen / committen.

## Teil G — Testen

19. Schatzsuche bis zum Ende spielen → **nur Urkunde** anfordern.
    E-Mail prüfen (auch Spam), Link öffnen, als PDF speichern.
20. Mit **Newsletter-Häkchen** testen → Bestätigungsmail kommt → bestätigen →
    Kontakt erscheint in der Liste, Willkommensmail kommt.

---

## Den Zähler ablesen

- **In Brevo:** *Transaktional → Statistik / Logs*, nach Tag **`urkunde-baggersee`** filtern.
- **Dein dauerhafter Zähler:** im Cloudflare-KV (`seehueter`) der Schlüssel
  **`urkunden_total`**. Optional bauen wir später eine kleine Anzeige
  („Schon X Schätze gehoben!").

> Hinweis: Der KV-Zähler ist für eine Familien-Schatzsuche völlig ausreichend.
> Bei sehr vielen *gleichzeitigen* Abschlüssen kann er theoretisch minimal
> ungenau werden — für eine Familien-Schnitzeljagd kein Problem.

---

## Noch offen (nächster Schritt — sag Bescheid)

- **Datenschutzerklärung** ergänzen: Brevo als Auftragsverarbeiter, erhobene
  Daten, Double-Opt-In, Speicherdauer, Widerrufsrecht.
- **Texte** für die DOI-Bestätigungsmail und die Willkommensmail in eurer
  Markenstimme.
