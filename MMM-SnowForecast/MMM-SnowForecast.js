//console.log("stage1")

Module.register("MMM-SnowForecast", {
  // Default module config.
  defaults: {
    baseURL: "https://www.snow-forecast.com/resorts/Mount-Fuji/6day/",
    theme: "simplified", //default or simplified or simplified-portrait
    enabledRows: ["days", "time", "weather", "wind", "snow", "rain", "temperature-max", "temperature-chill"], //possible = ["days", "time", "weather", "phrases", "wind", "maps", "snow", "rain", "temperature-max", "temperature-min", "temperature-chill", "sunrise", "sunset"]
    updateIntervalHours: 1,
    forecastType: "snow", //mountain or snow depending which website it comes from
    mountainElevations: {
        top: "top",
        mid: "mid",
        bot: "bot",
    },
    elevation: "mid", // "top", "mid", or "bot" - which elevation to show by default
  },

  getStyles: function () {
    const file = `snow-forecast-${this.config.theme}.css`;
    return [this.file(file)];
  },

  // Start function to say loading forecast
  start: function () {

    this.topHTML = "Loading forecast...";

    let notification;
    let payload;

    if (this.config.forecastType === "snow") {

        console.log("MMM-SnowForecast: Sending SNOW request to node helper");
        console.log("URL:", this.config.baseURL);

        notification = "GET_SNOW_FORECAST";
        payload = this.config.baseURL;

    } else if (this.config.forecastType === "mountain") {

        console.log("MMM-SnowForecast: Sending MOUNTAIN request to node helper");
        console.log("URL:", this.config.baseURL);

        notification = "GET_MOUNTAIN_FORECAST";
        payload = {
            baseURL: this.config.baseURL,
            mountainElevations: this.config.mountainElevations,
        };

    } else if (this.config.forecastType === "surf") {

        console.log("Surf selected - needs to be built still");
        this.topHTML = "Surf forecast not yet implemented";
        return;

    } else {

        console.error("MMM-SnowForecast: Unknown forecastType:", this.config.forecastType);
        this.topHTML = "Error: Unknown forecastType";
        return;
    }

    // Get forecast immediately
    this.sendSocketNotification(
        notification,
        payload
    );

    // Get forecast again every hour
    setInterval(() => {

        this.sendSocketNotification(
            notification,
            payload
        );

    }, this.config.updateIntervalHours * 60 * 60 * 1000);
},

  socketNotificationReceived: function(notification, payload) {
      if (notification === "SNOW_FORECAST_HTML") {
          this.topHTML = payload.top;
          this.midHTML = payload.mid;
          this.botHTML = payload.bot;
          this.currentHTML = this[this.config.elevation + 'HTML'];
          console.log("elevation should be midHTML: " + this.currentHTML); 
          this.updateDom();
      } else if (notification === "MOUNTAIN_FORECAST_HTML") {
           this.topHTML = payload.top;
            this.midHTML = payload.mid;
            this.botHTML = payload.bot;
            this.currentHTML = this[this.config.elevation + "HTML"];
            console.log("Main script: Mountain forecast received");
            console.log("Current elevation:", this.config.elevation);

            this.updateDom();
      } else if (notification === "SURF_FORECAST_HTML") {
          
      }
  },

  // Override dom generator.
  getDom: function () {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = this.currentHTML || this.topHTML;

      const rows = wrapper.querySelectorAll("tr[data-row]");
      rows.forEach((row) => {
          const rowType = row.getAttribute("data-row");
          if (!this.config.enabledRows.includes(rowType)) {
              row.style.display = "none";
          }
      });

      // Wire up altitude switcher to swap local data instead of navigating away
      const self = this;
      const elevationLinks = wrapper.querySelectorAll(".forecast-table-elevation-switcher__link");
      elevationLinks.forEach((link) => {
          link.addEventListener("click", (e) => {
              e.preventDefault();
              const href = link.getAttribute("href");
              if (href.endsWith(self.config.mountainElevations.top)) self.currentHTML = self.topHTML;
              else if (href.endsWith(self.config.mountainElevations.mid)) self.currentHTML = self.midHTML;
              else if (href.endsWith(self.config.mountainElevations.bot)) self.currentHTML = self.botHTML;
              self.updateDom();
          });
      });

      return wrapper;
  },
});

//console.log("stage2")