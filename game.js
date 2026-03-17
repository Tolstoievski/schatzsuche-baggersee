```javascript
const TEST_MODE = false;

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

function checkLocation(targetLat,targetLon,radius){

const result = document.getElementById("gpsResult");
const questionBox = document.getElementById("questionBox");

if(!result || !questionBox){
alert("Fehler: Elemente fehlen");
return;
}

if(TEST_MODE){
result.innerHTML = "Testmodus aktiv";
questionBox.classList.remove("hidden");
return;
}

result.innerHTML = "GPS wird gesucht...";

if(!navigator.geolocation){
result.innerHTML = "Kein GPS verfügbar";
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
result.innerHTML = "Perfekt!";
questionBox.classList.remove("hidden");
}else{
result.innerHTML = "Noch nicht ganz richtig";
}

},

function(){
result.innerHTML = "GPS Fehler";
}

);

}

function checkAnswer(correctAnswer){

const next = document.getElementById("nextClue");

const val =
document.getElementById("answer").value.trim().toLowerCase();

if(val == correctAnswer){
next.classList.remove("hidden");
}else{
alert("Leider falsch");
}

}
```
