# MMM-SnowForecast
Module for MagicMirror that displays the snow-forecast.com or mountain-forecast.com. Could be easily adapted for surf-forecast.com if requested.

Please make sure your updateIntervalHours is as large as is reasonable for you, this module is scraping the data as snow-forecast did not reply to using the official API. So to make sure we don't become a burden on their servers and make them change their website setup which could break this module, please update it as infrequently as possible, mine is set to every 6 hours

**Screenshot**
<img width="2179" height="826" alt="image" src="https://github.com/user-attachments/assets/83254ef2-668e-4633-a6b2-e93b064b7714" />

**Features**
Replicates the snow-forecast table on your magic mirror with minimal processing power as collects the data once then updates at a set interval (recommended 1-3 hours).

**Install**
```
  npm install cheerio
  cd ~/MagicMirror/modules
  git clone https://github.com/howardctrichards/MMM-SnowForecast
```

**Config**
Snow-forecast config, note the baseURL must end in with the forward slash, but not have bot or mid or top as this is done in the module:
```
{
	module: "MMM-SnowForecast",
	position: "bottom_bar",
	order: "*",
    hiddenOnStartup: false,
    disabled: false,
	config: {
	  baseURL: "https://www.mountain-forecast.com/peaks/Daisetsu/forecasts/",
	  theme: "simplified-portrait",
	  enabledRows: ["days", "time", "weather", "wind", "snow", "rain", "temperature-max", "temperature-min", "temperature-chill"],
	  updateIntervalHours: 1,
	  forecastType: "mountain",
	  mountainElevations: {
		  top: "2290",
		  mid: "1500",
		  bot: "500",
	  },
	  elevation: "top",
	},
},
```

Parameter | Values
--- | ---
baseURL | This is the specific forecast you wish to display from snow-forecast.com or mountain-forecast.com. Must end in forward slash and not include the specific elevation (bot/mid/top) or (1895/1000)
theme | Stock options are "default" which is a straight replica of the website, "simplified and "simplified-portrait" which are my custom stylings. You can make your own by creating a "snow-forecast-`THEME_NAME`.css file in the main folder and setting "THEME_NAME" as the theme
enabledRows | Rows you wish to display, options are: ["days", "time", "weather", "phrases", "wind", "maps", "snow", "rain", "temperature-max", "temperature-min", "temperature-chill", "sunrise", "sunset"]
updateIntervalHours | How often the module will update the forecast in hours. Please keep this high (3-12 hours) as obviously forecasts don't change that quick but do not want to get blocked by the snow-forecast website
forecastType | "snow" or "mountain" depending on the website in use. Potential to add "surf-forecast.com" on request
mountainElevations | Remove for snow-forecast, for mountain-forecast please denote the set elevations on the website, should be the bit after /forecasts/ in the url as well. Module automatically adjusts to only 2 elevations, please set as top and bot e.g. {top: "1893", bot: "1000"}
elevation | Default elevation to be shown on startup (top/mid/bot)

**CSS Styling**

There is some very easy adjustment of this module to be done in the css files. You can scale it with just a few numbers in the header and edit fill colours
```
  :root {
    --snow-forecast-column-scale: 2;
    --snow-forecast-row-scale: 2;
    --snow-forecast-text-scale: 1.5;
    --snow-forecast-rain-fill: rgba(51, 132.6, 255, 0.7);
    --snow-forecast-snow-fill: rgba(212,17,33, 0.7);
    --snow-forecast-data-row-height: 20px;
    --snow-forecast-night-filter: hue-rotate(65deg);
    --snow-forecast-snow-filter: saturate(5);
    --snow-forecast-elevation-text-size: 10px;
    --snow-forecast-elevation-vertical-offset: -9px; /*djust this to align the elevation switcher with the top of the table if desired*/
  }
```

<img width="510" height="115" alt="image" src="https://github.com/user-attachments/assets/2606645d-394b-4dfd-a92d-19636558c157" />
You can change your icons by simply changing the links to these images. The best way is collate all of the icons in one folder, and then change the content links to your new folder and file names.
You can also use .gif's although I'd recommend .apng's just as they have transparent backgrounds so look much better on a MagicMirror

```
/*//////////////////////// ICONS   ///////////////change links below to change icons////////////*/
  /* Clear - day */
  .weather-icon[alt="clear"] {
    content: url("icons/windows-11-color/icons8-sun-100.png");
    /* Clear - night */
    .forecast-table__container--border & {
      content: url("icons/windows-11-color/icons8-moon-100.png");
    }
  }
  /* Part cloud - day */
  .weather-icon[alt="part cloud"] {
    content: url("icons/windows-11-color/icons8-partly-cloudy-day-100.png");
    /* Part cloud - night */
    .forecast-table__container--border & {
      content: url("icons/windows-11-color/icons8-night-100.png");
    }
  }
  /* Cloud */
  .weather-icon[alt="cloud"] {
etc.
```

You can disable the colour fill for snow, rain and temperatures by simply commenting out the section (delete last asterisk in leading ///// line).
Temperature:
```
/*///////    temperature min/max shading    //////  insert or remove asterisk here to enable or disable temperature colours>>>  */
  
  .forecast-table__row[data-row="temperature-max"] .forecast-table__cell:has(.temp-value--cold.temp-value--1),
  .forecast-table__row[data-row="temperature-chill"] .forecast-table__cell:has(.temp-value--cold.temp-value--1),
  .forecast-table__row[data-row="temperature-min"] .forecast-table__cell:has(.temp-value--cold.temp-value--1) {
    background-color: rgba(82, 0, 82, 1);
    fill: rgba(82, 0, 82, 1);
    color: #fff;
  }
```

Snow/rain:
```
/*//////////    opacity fill snow    //////////  insert or remove asterisk here to enable or disable snow box fill>>>  */
  .forecast-table__container--snow {
    position: relative;
    overflow: hidden;
  }
```
