//console.log("node_helper.js: file loaded");
const NodeHelper = require("node_helper");
const cheerio = require("cheerio");
//console.log("node_helper.js: pre-requisites loaded");

module.exports = NodeHelper.create({

    start: function() {
    },

    socketNotificationReceived: async function(notification, payload) {
        if (notification === "GET_SNOW_FORECAST") {
            console.log("node_helper: received GET_SNOW_FORECAST for", payload);
            try {
                await getSnowHTML(payload, this);
            } catch (err) {
                console.error("node_helper: error fetching snow forecast:", err);
            }
        }  else if (notification === "GET_MOUNTAIN_FORECAST") {
            console.log("node_helper: received GET_MOUNTAIN_FORECAST for", payload);
            try {
                await getMountainHTML(payload, this);
            } catch (err) {
                console.error("node_helper: error fetching mountain forecast:", err);
            }
        } else if (notification === "GET_SURF_FORECAST") {
            console.log("node_helper: received GET_SURF_FORECAST for", payload);
            try {
                await getSurfHTML(payload, this);
            } catch (err) {
                console.error("node_helper: error fetching surf forecast:", err);
            }
        }
    }

});

async function getSnowHTML(url, nodeHelper) {
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Encoding": "identity"
    };

    const rawTop = await fetch(url + "top", { headers });
    const topHTML = await rawTop.text();
    const rawMid = await fetch(url + "mid", { headers });
    const midHTML = await rawMid.text();
    const rawBot = await fetch(url + "bot", { headers });
    const botHTML = await rawBot.text();

    const siteOrigin = "https://www.snow-forecast.com";

    function extractTable(html) {
        const $ = cheerio.load(html);

        const $table = $("#forecast-table");

        $table.find('tr[data-row="summary"]').remove();
        $table.find(".forecast-table__scroll-button--left").remove();
        $table.find(".forecast-table__scroll-button--right").remove();
        $table.find(".incentive").remove();
        $table.find(".forecast-table__spacer").remove();

        // Remove day-header buttons entirely — locked/unlocked icons, non-functional without site JS
        $table.find(".forecast-table-days__button").remove();

        $table.find("[src]").each((i, el) => {
            const src = $(el).attr("src");
            if (src && src.startsWith("/")) $(el).attr("src", siteOrigin + src);
        });
        $table.find("[href]").each((i, el) => {
            const href = $(el).attr("href");
            if (href && href.startsWith("/")) $(el).attr("href", siteOrigin + href);
        });

        return $table.prop("outerHTML");
    }

    const topTableHTML = extractTable(topHTML);
    const midTableHTML = extractTable(midHTML);
    const botTableHTML = extractTable(botHTML);

    nodeHelper.sendSocketNotification(
        "SNOW_FORECAST_HTML",
        {
            top: topTableHTML,
            mid: midTableHTML,
            bot: botTableHTML,
        }
    );
}

async function getMountainHTML(payload, nodeHelper) {
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Encoding": "identity"
    };
    const baseURL = payload.baseURL;
    const mountainElevations = payload.mountainElevations;
    const elevationCount = Object.values(payload.mountainElevations).filter(Boolean).length
    const elevationSwitcherHTML = createElevationSwitcher(baseURL, mountainElevations, elevationCount);
    const siteOrigin = "https://www.mountain-forecast.com";

    if (elevationCount === 3) {
        console.log("topURL: " + baseURL + mountainElevations.top)
        rawTop = await fetch(baseURL + mountainElevations.top, { headers });
        topHTML = await rawTop.text();
        rawMid = await fetch(baseURL + mountainElevations.mid, { headers });
        midHTML = await rawMid.text();
        rawBot = await fetch(baseURL + mountainElevations.bot, { headers });
        botHTML = await rawBot.text();
    } else if (elevationCount === 2) {
        console.log("topURL: " + baseURL + mountainElevations.top)
        rawTop = await fetch(baseURL + mountainElevations.top, { headers });
        topHTML = await rawTop.text();
        rawBot = await fetch(baseURL + mountainElevations.bot, { headers });
        botHTML = await rawBot.text();
    }

    function extractTable(html) {
        const $ = cheerio.load(html);

        const $table = $("#forecast-table");

        $table.find('tr[data-row="summary"]').remove();
        $table.find(".forecast-table__scroll-button--left").remove();
        $table.find(".forecast-table__scroll-button--right").remove();
        $table.find(".incentive").remove();
        // Remove day-header buttons entirely — locked/unlocked icons, non-functional without site JS
        $table.find(".forecast-table-days__button").remove();
        $table.find(".forecast-table__header-container--units").remove()
        $table.find(".forecast-table__spacer").replaceWith(elevationSwitcherHTML);

        $table.find("[src]").each((i, el) => {
            const src = $(el).attr("src");
            if (src && src.startsWith("/")) $(el).attr("src", siteOrigin + src);
        });
        $table.find("[href]").each((i, el) => {
            const href = $(el).attr("href");
            if (href && href.startsWith("/")) $(el).attr("href", siteOrigin + href);
        });

        return $table.prop("outerHTML");
    }

    const topTableHTML = extractTable(topHTML);
    let midTableHTML = null;
    if (elevationCount === 3) {
        midTableHTML = extractTable(midHTML);
    }
    const botTableHTML = extractTable(botHTML);

    if (elevationCount === 3) {
        nodeHelper.sendSocketNotification(
            "MOUNTAIN_FORECAST_HTML",
            {
                top: topTableHTML,
                mid: midTableHTML,
                bot: botTableHTML,
            }
        );
    } else if (elevationCount === 2) {
        nodeHelper.sendSocketNotification(
            "MOUNTAIN_FORECAST_HTML",
            {
                top: topTableHTML,
                bot: botTableHTML,
            }
        );
    }
}

function createElevationSwitcher(baseURL, elevations) {

    const elevationEntries = Object.entries(elevations)
        .filter(([name, elevation]) => elevation);

    const linksHTML = elevationEntries.map(
        ([name, elevation], index) => {

            const activeClass =
                index === 0
                    ? " forecast-table-elevation-switcher__link--active"
                    : "";

            return `<li class="forecast-table-elevation-switcher__item">
                        <a class="forecast-table-elevation-switcher__link${activeClass}" href="${baseURL}${elevation}"><span class="height">${elevation}</span> <span class="heightu">m</span></a>
                    </li>`;
        }
    ).join("");

    return `
        <div class="not_in_print forecast-table-elevation-switcher">

            <div class="forecast-table-elevation-switcher__label">Elevation<svg
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    version="1.1"
                    viewBox="0 0 100 100"
                    class="forecast-table-elevation-switcher__elevation-icon"
                    width="34"
                    height="34"
                >
                    <polygon
                        fill="#ff5a5a"
                        points="55 20.6 35 55.7 73.7 55.7 55 20.6"
                    ></polygon>

                    <path d="M54.9,23.3l19.1,36.1,19.4,36.6h-37.2l-20.5-38.8,19.3-33.9M55,15l-24,42.2,22.7,42.8h46.3l-22.5-42.5L55,15h0Z"></path>

                    <path d="M29.1,53.5l22.5,42.5H6.6l22.5-42.5M29.1,45L0,100h58.2l-29.1-55h0Z"></path>

                    <polyline
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2px"
                        points="41.6 41.7 48 48.1 54.4 41.7 60.9 48.2 67.5 41.6"
                    ></polyline>
                </svg>
            </div>

            <ul class="forecast-table-elevation-switcher__list">
                ${linksHTML}
            </ul>

        </div>
    `;
}