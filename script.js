
let socket;
let chart;
let coin = localStorage.getItem('selectedCoin') || 'ethusdt';
let interval = localStorage.getItem('selectedInterval') || '1m';
let chartData = {};

//Chart.register(Chart.FinancialController, Chart.CandlestickElement);

//Initialize chart.js
const ctx = document.getElementById('candlestickChart').getContext('2d');
chart = new Chart(ctx, {
    type: 'bar',
    data: {
        datasets: [{
            label: 'Candlestick Chart',
            data: []
        }]
    },
    Options: {
        responsive: true,
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'minute'
                },
                title: {
                    display: true,
                    text: 'Time'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Price'
                }
            }
        }
    }
})


//Fetch Elements
const coinSelect = document.getElementById('coinSelect');
const intervalSelect = document.getElementById('intervalSelect');


//Set initial dropdown values
coinSelect.value = coin;
intervalSelect.value = interval;


//WebSocket Function
function connectWebSocket(symbol, klineInterval) {
    if(socket) {
        socket.close();
    }
    socket = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@kline_${klineInterval}`);
    console.log(socket);

    socket.onopen = function() {
        console.log('Connected to WebSocket');
    }
    
    
    socket.onmessage = function(event) {
        console.log(event.data)
        const message = JSON.parse(event.data);
        const candlestick = message.k;

        //Format data for chart.js
        const formattedData = {
            x: new Date(candlestick.t),
            o: parseFloat(candlestick.o),
            h: parseFloat(candlestick.h),
            l: parseFloat(candlestick.l),
            c: parseFloat(candlestick.c)
        }


        //Store data in local storage for persistance
        if(!chartData[symbol]) {
            chartData[symbol] = [];
        }
        chartData[symbol].push(formattedData);

        localStorage.setItem(symbol, JSON.stringify(chartData[symbol]));


        //Update chart with new data
        updateChart(symbol);
    }

    socket.onclose = function() {
        console.log('WebSocket closed');
    };
}

//Update the chart with data
function updateChart(symbol) {
    if(localStorage.getItem(symbol)) {
        const savedData = JSON.parse(localStorage.getItem(symbol));
        chart.data.datasets[0].data = savedData;
        chart.update();
    }
}


//Event Listeners
coinSelect.addEventListener('change', () => {
    coin = coinSelect.value;
    localStorage.setItem('selectedCoin', coin);
    connectWebSocket(coin, interval);
    updateChart(coin);
});

intervalSelect.addEventListener('change', () => {
    interval = intervalSelect.value;
    localStorage.setItem('selectedInterval', interval);
    connectWebSocket(coin, interval);
});


//Initial Websocket connection
connectWebSocket(coin, interval);
updateChart(coin); 




/*const ctx = document.getElementById('candlestickChart');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

*/



  
