
require('dotenv').config()

var cron = require('node-cron')
var Push = require('pushover-notifications')
const download = require('image-downloader');

var p = new Push({
    token: process.env.APP_TOKEN,
    user: process.env.USERKEY,
})


let weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']


// cron.schedule('0 0 8 * * *', getWeather)

getWeather();

async function getWeather() {

    //Get Date information
    let ts = Date.now();
    let d = new Date(ts);
    let day = d.getDay();
    let month = d.getMonth()+1;
    let date = d.getDate();

    //Fetch Weather information from weatherapi.com
    let url = 'http://api.weatherapi.com/v1/forecast.json?key='+process.env.WEATHER_KEY+'&q='+process.env.ZIP_CODE+'&days=1&aqi=no&alerts=no'
    let answer = await fetch(url)
    let data = await answer.json()
    let foreData = data.forecast.forecastday[0].day

    //Sets strings to be sent in notification using api data
    let condition = weekDays[day]+', '+month+'/'+date+' - '+foreData.condition.text;
    let forecast = 'Low of ' + foreData.mintemp_f + '° and a high of ' + foreData.maxtemp_f+'°. Chance of rain is '+foreData.daily_chance_of_rain+'%';

    //Options for downloading the weather icon image to the server
    //Images must be served because pushover-notifications uses fs.readfilesync
    let options = {
        url: 'https://'+foreData.condition.icon.substring(2),
        dest: __dirname+'/icons',
    };

    //Message is sent once the image has been successfully downloaded (and we know the filename)
    download.image(options)
    .then(({ filename }) => {
        sendMessage(condition, forecast,filename);
    })
    .catch((err) => console.error(err));
}


function sendMessage(Ctitle, body, filePath){
    var msg = {
        message: body,
        title: Ctitle,
        sound: 'pianobar',
        priority: 1,
        file: filePath,
        url: "https://weather.com/weather/tenday/l/New+York+NY+USNY0996:1:US",
        url_title: "Detailed Weather Forecast"
    }
    p.send( msg, function(err, result) {
        if(err){
            throw err;
        }
        console.log(result)
    })
}


