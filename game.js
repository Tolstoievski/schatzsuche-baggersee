```javascript
const TEST_MODE = false;

function checkLocation(targetLat,targetLon,radius){

const result = document.getElementById("gpsResult");
const questionBox = document.getElementById("questionBox");

/* daca nu exista → STOP clar */

if(!result){
alert("gpsResult nu exista");
return;
}

if(!questionBox){
alert("questionBox nu exista");
return;
}

/* TEST MODE */

if(TEST_MODE){
result.innerHTML = "Testmodus aktiv";
questionBox.classList.remove("hidden");
return;
}

/* LOADING */

result.innerHTML = "GPS wird gesucht...";

/* GPS */

if(!navigator.geolocation){
result.innerHTML = "Kein GPS verfügbar";
return;
}

navigator.geolocation.getCurrentPosition(

function(pos){

const distance = Math.sqrt(
Math.pow(pos.coords.latitude-targetLat,2) +
Math.pow(pos.coords.longitude-targetLon,2)
)*111000;

if(distance <= radius){
result.innerHTML = "Richtig!";
questionBox.classList.remove("hidden");
}else{
result.innerHTML = "Noch nicht richtig";
}

},

function(){
result.innerHTML = "GPS Fehler";
}

);

}

function checkAnswer(correctAnswer){

const next = document.getElementById("nextClue");

if(!next){
alert("nextClue fehlt");
return;
}

const val =
document.getElementById("answer").value.trim().toLowerCase();

if(val == correctAnswer){
next.classList.remove("hidden");
}else{
alert("Leider falsch");
}

}
```
