const URL = "https://smarttransport.online/magnitogorsk/php/apiRequest.php?getStationForecasts.php";

const stations = {
  "Цирк": {
    id: 10116,
    description: "в сторону Площадь Мира"
  },
  "Юность": {
    id: 10017,
    description: "в сторону Проспект Карла Маркса 115"
  },
  "Улица Труда": {
    id: 10053,
    description: "в сторону Улица Бориса Ручьева"
  }
};

function getPayload(station_id) {
  return {
    t: "11111111-50b3-4fec-b922-8a50a1d38366",
    ct: 26,
    cd: "getStationForecasts.php",
    reg: 74004,
    w: -1,
    data: {
      wuid: 22894495672,
      sid: station_id
    }
  };
}

async function fetchStation(station) {
  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(getPayload(station.id))
    });

    const json = await res.json();

    if (json.r !== "ok") return [];

    return json.data
      .sort((a, b) => a.arrivalTimeInSec - b.arrivalTimeInSec)
      .map(r => ({
        short: r.routeShortName,
        dest: r.whereGo,
        time: r.arrivalTimeInSec >= 60
          ? Math.round(r.arrivalTimeInSec / 60)
          : "<1"
      }));

  } catch (e) {
    console.error("API error:", e);
    return [];
  }
}

function renderStation(name, station, routes) {
  const div = document.createElement("div");
  div.className = "station";

  let html = 
    `<div class="station-title">${name}</div>
    <div class="station-desc">${station.description}</div>`;

  if (!routes.length) {
    html += `<div style="color:#555">Нет данных...</div>`;
  } else {
    routes.forEach(r => {
      html += 
        `<div class="row">
          <div class="route">${r.short}</div>
          <div class="dest">${r.dest}</div>
          <div class="time">${r.time}м</div>
        </div>`;
    });
  }

  div.innerHTML = html;
  return div;
}

async function update() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  for (const [name, station] of Object.entries(stations)) {
    const routes = await fetchStation(station);
    app.appendChild(renderStation(name, station, routes));
  }
}

update();
setInterval(update, 15000);

let ticking = false;

window.addEventListener("scroll", () => {
  const y = window.scrollY;

  if (!ticking) {
    requestAnimationFrame(() => {
      const stretch = Math.min(y * 0.0008, 0.02);
      document.body.style.transform = `scaleY(${1 + stretch})`;
      ticking = false;
    });

    ticking = true;
  }
});

setInterval(() => {
  document.body.style.transform = "scaleY(1)";
}, 150);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}