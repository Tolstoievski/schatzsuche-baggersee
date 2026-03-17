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

navigator.geolocation.getCurrentPosition(function(pos){

const distance = getDistance(
pos.coords.latitude,
pos.coords.longitude,
targetLat,
targetLon
);

if(distance <= radius){

document.getElementById("gpsResult").innerHTML =
"<span class='success'>Perfekt! Ihr seid am richtigen Ort.</span>";

document.getElementById("questionBox").classList.remove("hidden");

}else{

document.getElementById("gpsResult").innerHTML =
"<span class='error'>Noch nicht ganz richtig – schaut euch weiter um.</span>";

}

});
}

function launchCoins(){

for(let i=0;i<30;i++){

const coin=document.createElement("div");

coin.className="coin";
coin.innerHTML="💰";

coin.style.left=Math.random()*100+"vw";
coin.style.animationDuration=(2+Math.random()*3)+"s";

document.body.appendChild(coin);

}

}