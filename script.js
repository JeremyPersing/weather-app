let d = new Date();
let day = d.getDay();
let date = d.getDate();

async function getWeather() {
    let city = document.getElementById('cityInput').value;
    let state = document.getElementById('stateInput').value;
    let country = document.getElementById('countryInput').value;
    
    if (city === '') {
        alert("Please enter a city");
    }
    else {
        const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=' + city + ', ' + state + ', ' + country + '&units=imperial&appid=b6208a5ed3073fd5effd752535b4e00a', {mode: 'cors'});
        const weatherData = await response.json();
        displayWeather(weatherData);

        let lat = weatherData.coord.lat;
        let lon = weatherData.coord.lon;

        const weekResponse = await fetch('https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&exclude=current,minutely,hourly,alerts&units=imperial&appid=3a613209273f0897e90988fbbcc2fd04', {mode: 'cors'});
        const weekData = await weekResponse.json();
        displayWeeklyWeather(weatherData, weekData);
    }  
}

function displayWeather(object) {
    //get the weatherDiv div
    let weatherDiv = document.getElementById('weatherDiv');


    if (document.getElementById('innerWeatherDiv')) {
        document.getElementById('innerWeatherDiv').remove();
    }

    // Creating a div to store the JSON data in
    let innerWeatherDiv = document.createElement('div');
    innerWeatherDiv.id = 'innerWeatherDiv';
    innerWeatherDiv.appendChild(getLocation(object));
    weatherDiv.appendChild(innerWeatherDiv);
    
    //Creating the div that will store the current weather and coversion button
    let tempDiv = document.createElement('div');
    tempDiv.id = 'tempDiv';
    innerWeatherDiv.appendChild(tempDiv);

    // Creating an element to store the current weather in
    let currWeather = document.createElement('h1');
    currWeather.id = 'currWeather';
    currWeather.innerText = object.main.temp + '°F | ';
    tempDiv.appendChild(currWeather);

    let convertButton = document.createElement('h1');
    convertButton.id = 'convertButton'
    convertButton.onclick = () => {mainToCelsius(object.main.temp)}
    convertButton.innerText = ' °C';
    tempDiv.appendChild(convertButton);

    // Setting the image for the current weather
    innerWeatherDiv.appendChild(setImage(object.weather[0].id));  

    // Creating a div for the minor weather details
    let minorDetails = document.createElement('div');
    minorDetails.innerHTML = '<p>Conditions: <strong>' + object.weather[0].main + '</strong></p>' +
                            '<p>Humidity: ' + object.main.humidity + '%</p>' +
                            '<p>Wind: ' + object.wind.speed + ' MPH</p>';
    innerWeatherDiv.appendChild(minorDetails);  
}

function displayWeeklyWeather(todayObject, weekObject) {
    // Get outer div for the weekly forecast
    let forecastDiv = document.getElementById('forecastDiv');
    
    // Create the heading
    if (!document.getElementById('weeklyForecastHeading')) {
        let heading = document.createElement('h2');
        heading.id = 'weeklyForecastHeading';
        heading.className = 'text-center';
        heading.innerText = 'Weekly Forecast';
        forecastDiv.appendChild(heading);
    }

    // Create new div for forecast
    let innerForecastDiv = document.createElement('div');
    innerForecastDiv.id = 'innerForecastDiv';
    forecastDiv.appendChild(innerForecastDiv);

    createForecastDiv(todayObject.weather[0].id, weekObject);
}

// Turns fahrenheit to celsius
function toCelsius(num) {
    let celsius = num - 32;
    celsius = celsius / 1.8;
    celsius = celsius.toFixed(2);
    return celsius;
}

//Turn celsius to fahrenheit
function toFahrenheit(num) {
    let fahrenheit = num * 1.8;
    fahrenheit += 32;
    fahrenheit = fahrenheit.toFixed(2);
    return fahrenheit;
}

// Turns the current temperature to celsius for the current day
function mainToCelsius(num) {
    // Convert to celsius
    let celsius = toCelsius(num);

    // Place number in the 
    let currWeather = document.getElementById('currWeather');
    currWeather.innerText = celsius + '°C | ';

    // Convert the thumbnail weathers to celsius
    thumbnailsToCelsius();

    //Replace button innerText to fahrenheit
    let convertButton = document.getElementById('convertButton');
    convertButton.innerText = '°F';
    convertButton.id = 'convertButton';
    convertButton.onclick = () => {mainToFahrenheit(celsius)};

}
 
// Turns the current temperature to fahrenheit
function mainToFahrenheit(celsius) {
    // Convert to fahrenheit
    let fahrenheit = toFahrenheit(celsius);

    // Place number in the 
    let currWeather = document.getElementById('currWeather');
    currWeather.innerText = fahrenheit + '°F | ';

    // Convert the thumbnail weathers to fahrenheit
    thumbnailsToFahrenheit();

    //Replace button innerText to fahrenheit
    let convertButton = document.getElementById('convertButton');
    convertButton.innerText = '°C';
    convertButton.onclick = () => {mainToCelsius(fahrenheit)};
}

// Gets the current location for displayed weather
function getLocation(object) {
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let div = document.createElement('div');
    let h2 = document.createElement('h2');
    
    let city = object.name;
    let country = object.sys.country;
    let currDate = days[day] + ' ' + date;
    
    h2.innerText = currDate + ' ' + city + ', ' + country;
    div.appendChild(h2);
    return div;
}

// Function that places an image of the current weather on the screen based on a code 
// from the API
function setImage(idCode) {
    let img = document.createElement('img');
    img.alt = 'Weather Photo';
    if (idCode < 300 && idCode >= 200) {
        img.src = './GIFS/thunder.gif';
    }
    else if  (idCode < 400 && idCode >= 300) {
        img.src = './GIFS/drizzle.gif';
    }
    else if (idCode < 600 && idCode >= 500) {
        img.src = './GIFS/rain.gif';
    }
    else if (idCode < 700 && idCode >= 600) {
        img.src = './GIFS/snow.gif';
    }
    else if (idCode < 780 && idCode >= 700) {
        img.src = './GIFS/atmosphere.gif';
    }
    else if (idCode === 781) {
        img.src = './GIFS/tornado.gif';
    }
    else if (idCode === 800) {
        img.src = './GIFS/clear.gif';
    }
    else if (idCode > 800) {
        img.src = './GIFS/clouds.gif';
    }

    return img;
}

function createForecastDiv(currentDayIdCode, weekObject) {
    let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let daysArr = [];
    let datesArr = [];

    // Populate daysArr so they are on the same index as the object's data
    for (let i = day; i < day + 7; i++) {
        if (i > 6) {
            daysArr.push(days[i - 7]);
        }
        else {
            daysArr.push(days[i]);
        }
    }

    // Populate datesArr so they are on the same index as the object's data
    for (let i = date; i < date + 7; i++) {
        datesArr.push(i);
    }

    // Div to hold the thumbnails for upcoming weather
    let div = document.createElement('div');
    div.className = 'thumbnailList';
    
    // Create the thumbnails
    for (let i = 0; i < 7; i++) {
        if (document.getElementById('thumbnail')) {
            document.getElementById('thumbnail').remove();
        }
        let thumbnailDiv = document.createElement('div');
        thumbnailDiv.id = 'thumbnail';
        thumbnailDiv.className = 'thumbnail t' + i;
        div.appendChild(thumbnailDiv);
        let dayHeader = document.createElement('h3');
        dayHeader.innerText = daysArr[i] + ' ' + datesArr[i];
        thumbnailDiv.appendChild(dayHeader);
        // Display current weather img for today
        if (i === 0) {
            thumbnailDiv.appendChild(setImage(currentDayIdCode));
        }
        else {
            thumbnailDiv.appendChild(setImage(weekObject.daily[i].weather[0].id));
        }

        let maxTemp = weekObject.daily[i].temp.max;
        let minTemp = weekObject.daily[i].temp.min;

        let maxTempElement = document.createElement('p');
        maxTempElement.id = 'maxTemp' + i;
        maxTempElement.value = maxTemp;
        maxTempElement.innerText = 'Max: ' + maxTemp;

        let minTempElement = document.createElement('p');
        minTempElement.id = 'minTemp' + i;
        minTempElement.value = minTemp;
        minTempElement.innerText = 'Min: ' + minTemp;

        thumbnailDiv.appendChild(maxTempElement);
        thumbnailDiv.appendChild(minTempElement);
    }

    document.getElementById('innerForecastDiv').appendChild(div);
}

function thumbnailsToCelsius() {
    for (let i = 0; i < 7; i++) {
        let maxElement = document.getElementById('maxTemp' + i);
        let max = maxElement.value;
        let celsiusMax = toCelsius(max)
        maxElement.innerText = 'Max: ' + celsiusMax;
        maxElement.value = celsiusMax;

        let minElement = document.getElementById('minTemp' + i);
        let min = minElement.value;
        let celsiusMin = toCelsius(min);
        minElement.innerText = 'Min: ' + celsiusMin;
        minElement.value = celsiusMin;
    }
}

function thumbnailsToFahrenheit() {
    for (let i = 0; i < 7; i++) {
        let maxElement = document.getElementById('maxTemp' + i);
        let max = maxElement.value;
        let fMax = toFahrenheit(max);
        maxElement.innerText = 'Max: ' + fMax;
        maxElement.value = fMax;

        let minElement = document.getElementById('minTemp' + i);
        let min = minElement.value;
        let fMin = toFahrenheit(min);
        minElement.innerText = 'Min: ' + fMin;
        minElement.value = fMin;
    }
}