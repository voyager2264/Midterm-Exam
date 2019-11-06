
window.onload = () => {
    // Enable ChromeVox
    document.getElementById('enable-cvox').click();
}

function showWeather() {
    let GetWeather = function(req) {
	let data = JSON.parse(req.responseText);
	document.getElementById("temp").innerHTML=data.main.temp;
	document.getElementById("humidity").innerHTML=data.main.humidity;
    };
    handleRequestOnCompletion(GetWeather, "/~phbrown/CSC335/weather.php");
}
