function createSparkline(id, data, color) {
    const chartElement = document.querySelector(id);
    if (!chartElement) {
        return;
    }
    new ApexCharts(chartElement, {
        chart: {
            type: "area",
            height: 56,
            sparkline: { enabled: true },
            toolbar: { show: false },
            animations: {
                enabled: true,
                easing: "easeinout",
                speed: 900
            }
        },
        series: [{ data }],
        stroke: {
            curve: "smooth",
            width: 3
        },
        colors: [color],
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 0.35,
                opacityFrom: 0.45,
                opacityTo: 0,
                stops: [0, 100]
            }
        },
        markers: { size: 0 },
        grid: { show: false },
        tooltip: { enabled: false }
    }).render();
}

function createTopPostsChart() {
    const chartElement = document.querySelector("#topPostsChart");
    if (!chartElement) {
        return;
    }
    new ApexCharts(chartElement, {
        chart: {
            type: "bar",
            height: 390,
            toolbar: { show: false },
            fontFamily: "DM Sans, sans-serif",
            background: "transparent",
            animations: {
                enabled: true,
                easing: "easeinout",
                speed: 900
            }
        },
        series: [{
            name: "Views",
            data: [5482, 3921, 2876, 2153, 1904]
        }],
        colors: ["#0b744b", "#1a8b5d", "#37a56f", "#58bf85", "#d8b056"],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "50%",
                borderRadius: 14,
                borderRadiusApplication: "end",
                distributed: true
            }
        },
        dataLabels: {
            enabled: true,
            offsetY: -10,
            style: {
                fontSize: "12px",
                fontWeight: 700,
                colors: ["#27483f"]
            },
            formatter: function (val) {
                return val.toLocaleString();
            }
        },
        stroke: {
            show: true,
            width: 2,
            colors: ["rgba(255,255,255,.55)"]
        },
        fill: {
            type: "gradient",
            gradient: {
                shade: "light",
                type: "vertical",
                shadeIntensity: 0.35,
                gradientToColors: ["#42d77e", "#5bdd8f", "#7be4a3", "#97e8b7", "#efcb73"],
                opacityFrom: 0.98,
                opacityTo: 0.72,
                stops: [0, 100]
            }
        },
        xaxis: {
            categories: ["UCC Heroes", "SSC", "VISION", "Dekalidad", "Community"],
            labels: {
                style: {
                    fontSize: "12px",
                    fontWeight: 600,
                    colors: "#42544c"
                },
                rotate: 0
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            max: 6000,
            tickAmount: 6,
            title: {
                text: "Views",
                offsetX: -10,
                style: {
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#365046"
                }
            },
            labels: {
                style: {
                    fontSize: "12px",
                    colors: "#5a6b65"
                },
                formatter: function (val) {
                    return val.toLocaleString();
                }
            }
        },
        grid: {
            borderColor: "#ebe5d8",
            strokeDashArray: 5,
            padding: {
                left: 10,
                right: 10,
                top: 12
            }
        },
        legend: {
            show: true,
            position: "top",
            horizontalAlign: "center",
            fontSize: "13px",
            fontWeight: 600,
            markers: {
                width: 18,
                height: 10,
                radius: 999
            }
        },
        tooltip: {
            theme: "light",
            style: {
                fontSize: "13px"
            },
            y: {
                formatter: function (val) {
                    return val.toLocaleString() + " views";
                }
            }
        },
        states: {
            hover: {
                filter: {
                    type: "lighten",
                    value: 0.18
                }
            }
        }
    }).render();
}

async function initializeDashboard() {
    await loadSharedLayout(); // from layout.js
    createSparkline("#chartPosts", [18, 25, 21, 32, 29, 40, 52], "#38d96c");
    createSparkline("#chartPending", [22, 27, 25, 31, 28, 36, 40], "#d0a214");
    createSparkline("#chartArchived", [46, 42, 38, 36, 33, 31, 28], "#9aa5aa");
    createSparkline("#chartUsers", [14, 18, 17, 24, 28, 31, 36], "#2fcb64");
    createSparkline("#chartVisitors", [12, 26, 18, 34, 28, 40, 48], "#38d96c");
    createTopPostsChart();
    lucide.createIcons();
}

initializeDashboard();