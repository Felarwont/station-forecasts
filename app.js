const API = 'https://smarttransport.online/magnitogorsk/php/apiRequest.php';

const stops = [
  {
    id: 10116,
    title: 'Цирк',
    description: 'в сторону Площадь Мира'
  },
  {
    id: 10017,
    title: 'Юность',
    description: 'в сторону Проспект Карла Маркса 115'
  },
  {
    id: 10053,
    title: 'Улица Труда',
    description: 'в сторону Улица Бориса Ручьева'
  }
];

async function getStopInfo(stopId) {

}

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
    throw new Error('Error, status:', response.status);
  }

  const json = await response.json();

  if (json.r !== 'ok') {
    console.error('API error:', json)
  }

  return json.data
    .sort((a, b) => a.arrivalTimeInSec - b.arrivalTimeInSec)
    .map(route => ({
      name: route.routeShortName,
      destination: route.whereGo,
      time: Math.floor(route.arrivalTimeInSec / 60) || "<1"
    }))
}

async function main() {
  const app = document.getElementById('app');
  for (const stop of stops) {
    const station = document.createElement('div');
    station.className = 'station';

    let html = 
      `<div class=station-title>${stop.title}</div>
      <div class=station-desc>${stop.description}</div>`

    const routes = await getRoutes(stop.id);

    for (const route of routes) {
      html +=
        `<div class=row>
          <div class=route>${route.name}</div>
          <div class=dest>${route.destination}</div>
          <div class=time>${route.time}м</div>
        </div>`
    }
    station.innerHTML = html
    app.appendChild(station)

  }
}

main();