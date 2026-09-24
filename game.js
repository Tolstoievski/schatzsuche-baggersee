/* =============================================
   DER SCHATZ DES SEEHÜTERS — Game Engine
   ============================================= */

/* ---- PROGRESS / ANTI-CHEAT ---- */

function getProgress() {
  return parseInt(localStorage.getItem("seehueter_progress") || "0");
}

function setProgress(station) {
  const current = getProgress();
  if (station > current) {
    localStorage.setItem("seehueter_progress", station);
  }
}

function checkAccess(requiredProgress) {
  const current = getProgress();
  if (current < requiredProgress) {
    document.body.innerHTML =
      '<div style="text-align:center;padding:60px 20px;font-family:Arial;background:#f4e2b8;min-height:100vh;">' +
      '<h2>🏴‍☠️ Nicht so schnell!</h2>' +
      '<p>Ihr müsst zuerst die vorherigen Stationen lösen.</p>' +
      '<br><a href="index.html"><button style="padding:14px 24px;font-size:18px;border:none;' +
      'border-radius:12px;background:#ffb703;cursor:pointer;">Zum Start</button></a>' +
      '</div>';
  }
}

function resetProgress() {
  localStorage.removeItem("seehueter_progress");
}

/* ---- HAVERSINE — distance in meters ---- */

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/* ---- TEST MODE: set to true to bypass GPS ---- */
const TEST_MODE = true;

/* ---- GPS CHECK with error handling ---- */

function checkLocation(targetLat, targetLon, radius) {
  const gpsResult = document.getElementById("gpsResult");

  if (TEST_MODE) {
    gpsResult.innerHTML = "<span class='success'>✅ [TEST] Standort übersprungen.</span>";
    document.getElementById("questionBox").classList.remove("hidden");
    return;
  }

  if (!navigator.geolocation) {
    gpsResult.innerHTML =
      "<span class='error'>⚠️ Euer Gerät unterstützt leider keine Standortabfrage.</span>";
    return;
  }

  gpsResult.innerHTML = "<span class='checking'>📡 Standort wird geprüft…</span>";

  navigator.geolocation.getCurrentPosition(
    function (pos) {
      const distance = getDistance(
        pos.coords.latitude,
        pos.coords.longitude,
        targetLat,
        targetLon
      );

      if (distance <= radius) {
        gpsResult.innerHTML =
          "<span class='success'>✅ Perfekt! Ihr seid am richtigen Ort.</span>";
        document.getElementById("questionBox").classList.remove("hidden");
      } else {
        const hint = distance > 500
          ? "Ihr seid noch weit entfernt — schaut auf die Hinweise!"
          : distance > 100
            ? "Schon in der Nähe — schaut euch weiter um!"
            : "Fast da! Nur noch ein paar Schritte!";
        gpsResult.innerHTML =
          "<span class='error'>📍 " + hint + " (" + Math.round(distance) + " m entfernt)</span>";
      }
    },
    function (err) {
      let msg;
      switch (err.code) {
        case 1:
          msg = "Standortzugriff verweigert. Bitte erlaubt die Standortfreigabe in den Einstellungen.";
          break;
        case 2:
          msg = "Standort konnte nicht ermittelt werden. Versucht es draußen erneut.";
          break;
        case 3:
          msg = "Zeitüberschreitung. Versucht es noch einmal.";
          break;
        default:
          msg = "Unbekannter Fehler bei der Standortabfrage.";
      }
      gpsResult.innerHTML = "<span class='error'>⚠️ " + msg + "</span>";
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
}

/* ---- CHECK TEXT/NUMBER ANSWER ---- */

function checkTextAnswer(correctAnswers, nextUrl, station) {
  const input = document.getElementById("answer");
  const val = input.value.trim().toLowerCase();
  const correct = correctAnswers.map(a => a.toLowerCase());

  if (correct.includes(val)) {
    setProgress(station);
    showSuccess();
  } else {
    handleWrongAnswer();
  }
}

/* ---- CHECK BUTTON ANSWER ---- */

function checkButtonAnswer(selected, correctAnswers, nextUrl, station) {
  const correct = correctAnswers.map(a => a.toLowerCase());
  if (correct.includes(selected.toLowerCase())) {
    setProgress(station);
    showSuccess();
  } else {
    handleWrongAnswer();
  }
}

/* ---- WRONG ANSWER counter + hint ---- */

let wrongCount = 0;

function handleWrongAnswer() {
  wrongCount++;
  const hintBox = document.getElementById("hintBox");

  if (wrongCount >= 2 && hintBox) {
    hintBox.classList.remove("hidden");
  }

  const questionBox = document.getElementById("questionBox");

  const oldError = questionBox.querySelector(".answer-error");
  if (oldError) oldError.remove();

  const errorMsg = document.createElement("p");
  errorMsg.className = "error answer-error";
  errorMsg.textContent = "❌ Leider falsch — versucht es noch einmal!";
  questionBox.appendChild(errorMsg);
}

/* ---- SHOW SUCCESS + next button ---- */

function showSuccess() {
  document.getElementById("nextClue").classList.remove("hidden");
  launchCoins();
}

/* ---- COIN ANIMATION ---- */

function launchCoins() {
  for (let i = 0; i < 30; i++) {
    const coin = document.createElement("div");
    coin.className = "coin";
    coin.innerHTML = "💰";
    coin.style.left = Math.random() * 100 + "vw";
    coin.style.animationDuration = (2 + Math.random() * 3) + "s";
    document.body.appendChild(coin);
  }
}
