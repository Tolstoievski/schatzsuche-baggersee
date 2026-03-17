```javascript
/* ============================= */
/* GLOBAL TEST MODE */
/* ============================= */

const TEST_MODE = true;


/* ============================= */
/* DISTANCE CALCULATION */
/* ============================= */

function getDistance(lat1, lon1, lat2, lon2){

const R = 6371000;

const dLat = (lat2-lat1)*Math.PI/180;
const dLon = (lon2-lon1)*Math.PI/180;

const a =
Math.sin(dLat/2)**2 +
Math.cos(lat1*Math.PI/180) *
Math.cos(lat2*Math.PI/180) *
Math.sin(dLon/2)**2;

const c = 2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));

return R*c;

}


/* ============================= */
/* SOUND EFFECT */
/* ============================= */

function playSuccessSound(){

const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
audio.play();

}


/* ============================= */
/* VIBRATION */
/* ============================= */

function vibrate(){

if(navigator.vibrate){
navigator.vibrate(200);
}

}


/* ============================= */
/* LOCATION CHECK + LOADER */
/* ============================= */

function checkLocation(targetLat,targetLon,radius){

const result = document.getElementById("gpsResult");

/* TEST MODE */

if(TEST_MODE){

result.innerHTML =
"<span class='success'>Testmodus aktiv – Standort akzeptiert.</span>";

document.getElementById("questionBox").classList.remove("hidden");

/* EFFECTS */

playSuccessSound();
vibrate();

return;

}


/* LOADING */

result.innerHTML = `
<div class="gps-loading">
<div class="spinner"></div>
GPS wird gesucht...
</div>
`;


/* GEOLOCATION */

if(!navigator.geolocation){

result.innerHTML =
"<span class='error'>Geolocation wird nicht unterstützt.</span>";

return;

}

navigator.geolocation.getCurrentPosition(

function(pos){

const distance = getDistance(
pos.coords.latitude,
pos.coords.longitude,
targetLat,
targetLon
);

if(distance <= radius){

result.innerHTML =
"<span class='success'>Perfekt! Ihr seid am richtigen Ort.</span>";

document.getElementById("questionBox").classList.remove("hidden");

/* EFFECTS */

playSuccessSound();
vibrate();

}else{

result.innerHTML =
"<span class='error'>Noch nicht ganz richtig – schaut euch weiter um.</span>";

}

},

function(error){

result.innerHTML =
"<span class='error'>Standort konnte nicht geladen werden. Bitte GPS aktivieren.</span>";

}

);

}


/* ============================= */
/* ANSWER CHECK */
/* ============================= */

function checkAnswer(correctAnswer){

if(TEST_MODE){

document.getElementById("nextClue").classList.remove("hidden");

/* EFFECTS */

playSuccessSound();
vibrate();

return;

}

const userAnswer =
document.getElementById("answer").value.trim().toLowerCase();

if(userAnswer == correctAnswer){

document.getElementById("nextClue").classList.remove("hidden");

/* EFFECTS */

playSuccessSound();
vibrate();

}else{

alert("Leider falsch");

}

}
```
