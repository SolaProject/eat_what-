const fetchPromise = fetch("./json/default.json");
let chart, data

fetchPromise
    .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP 请求错误：${response.status}`);
        }
        return response.json();
    })
    .then((json) => {
        data = json;
        show_data(data, sort_value=true, cmap_name="Blues");
    })
    .catch((error) => {
        console.log(`无法获取默认列表: ${error}`)
    })

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function show_data(data, sort_value=false, cmap_name="YlOrRd") {
    if (sort_value) {
        data.sort((a, b) => b.weight - a.weight);
    }
    let color_list = [];
    let hover_color_list = [];
    let cmap = chroma.scale(cmap_name);
    for (let i = 0; i < data.length; i++) {
        let color_temp = cmap(i/(data.length-1)).hex();
        color_list.push(chroma(color_temp).alpha(0.8).hex());
        hover_color_list.push(color_temp)
    }
    const ctx = document.getElementById('myChart');
    const config = {
        type: 'pie',
        data: {
            labels: data.map(row => row.name),
            datasets: [
                {
                    label: "default",
                    data: data.map(row => row.weight),
                    backgroundColor: color_list,
                    hoverBackgroundColor: hover_color_list,
                    hoverBorderColor: "black",
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'left',
                },
                title: {
                    display: true,
                    text: '目的地概率'
                }
            },
        },
    };
    chart = new Chart(ctx, config);
}

const actions = [
    {
        name: "update",
        handler(chart) {
            chart.data.datasets.forEach(dataset => {
                console.log(dataset);
            });
            chart.update();
        }
    },
    {
        name: "select",
        handler(chart) {
            
        }
    }
]

let botton = document.getElementById("eat_what");

botton.addEventListener("click", async () => {
    let borderColorList = chart.data.datasets[0].borderColor;
    let length = chart.data.datasets[0].data.length;
    let select = get_random_select(chart.data.datasets[0].data.slice());
    console.log(select);
    if (! borderColorList) {
        borderColorList = [];
        for (let i = 0; i < length; i++) {
            borderColorList.push("white");
        }
        chart.data.datasets[0].borderColor = borderColorList;
    }
    for (let i = 0; i < length*2+select; i++) {
        let j = i % length;
        if (i > 0) {
            borderColorList[(i-1)%length] = "white";
        }
        borderColorList[j] = "black";
        chart.update();
        await sleep(30);
    }
    for (let i = 0; i < length; i++) {
        borderColorList[i] = "white";
    }
    borderColorList[select] = "black";
    chart.update();
});

function get_random_select(weight) {
    let length = weight.length;
    let sum=0, rand;
    for (let i = 0; i < length; i++) {
        sum += weight[i];
    }
    rand = Math.random()*sum;
    for (let i = 0; i < length; i++) {
        rand -= weight[i];
        if (rand < 0) {
            return i;
        }
    }
}