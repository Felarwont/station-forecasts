const API = 'https://smarttransport.online/magnitogorsk/php/apiRequest.php';

const app = document.getElementById('app');

const stops = [
  {
    id: 10116,
    title: 'Цирк',
    direction: 'в сторону Площадь Мира'
  },
  {
    id: 10017,
    title: 'Юность',
    direction: 'в сторону Проспект Карла Маркса 115'
  },
  {
    id: 10053,
    title: 'Улица Труда',
    direction: 'в сторону Улица Бориса Ручьева'
  }
];

// TODO: Поиск остановок
// async function getStopInfo(stopId) {
// }

async function getRoutes(stopId) {
  const response = await fetch(API,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          t: '11111111-50b3-4fec-b922-8a50a1d38366',
          ct: 26,
          cd: 'getStationForecasts.php',
          reg: 74004,
          data: {
            sid: stopId
          }
        }
      )
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP Error, status: ${response.status}`);
  }

  const json = await response.json();

  if (json.r !== 'ok') {
    throw new Error(`API error: ${json}`);
  }

  return json.data
    .sort((a, b) => a.arrivalTimeInSec - b.arrivalTimeInSec)
    .map(route => ({
      name: route.routeShortName,
      destination: route.whereGo,
      time: Math.floor(route.arrivalTimeInSec / 60) || "<1"
    }));
}

function renderStopCard() {
  for (const stop of stops) {
    const station = document.createElement('div');
    station.className = 'station';
    station.dataset.id = stop.id;

    station.innerHTML =
      `<div class=station-title>${stop.title}</div>
      <div class=station-dir>${stop.direction}</div>`;
    app.appendChild(station);
  }
}

async function main() {
  for (const station of document.getElementsByClassName('station')) {
    try {
      const routes = await getRoutes(station.dataset.id);
      if (!routes.length) {
        station.innerHTML += '<div style=color:#555>Трамваев нет</div>';
      } else {
        routes.forEach(route => (
          station.innerHTML +=
            `<div class=row>
              <div class=route>${route.name}</div>
              <div class=dest>${route.destination}</div>
              <div class=time>${route.time}м</div>
            </div>`
        ));
      }
    } catch (Error) {
      station.innerHTML += '<div style=color:#555>Ошибка получения данных</div>';
    }
  }
}

renderStopCard()
main();