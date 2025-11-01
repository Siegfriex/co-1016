const dataSource = {
    chart: {
      caption: "GDP Growth Rate Comparison",
      yaxisname: "Quarterly GDP Growth Rate in %",
      subcaption: "India vs China",
      drawcrossline: "1",
      numbersuffix: "%",
      plottooltext: "$seriesName's GDP grew $dataValue in $label",
      theme: "candy"
    },
    categories: [
      {
        category: [
          {
            label: "April 2021"
          },
          {
            label: "July 2021"
          },
          {
            label: "Oct 2021"
          },
          {
            label: "Jan 2022"
          },
          {
            label: "April 2022"
          }
        ]
      }
    ],
    dataset: [
      {
        seriesname: "India",
        data: [
          {
            value: "3.374"
          },
          {
            value: "21.550"
          },
          {
            value: "9.111"
          },
          {
            value: "5.196"
          },
          {
            value: "3.958"
          }
        ]
      },
      {
        seriesname: "China",
        data: [
          {
            value: "6.40"
          },
          {
            value: "18.30"
          },
          {
            value: "7.90"
          },
          {
            value: "4.90"
          },
          {
            value: "4.00"
          }
        ]
      }
    ]
  };
  
  FusionCharts.ready(function() {
    var myChart = new FusionCharts({
      type: "msarea",
      renderAt: "chart-container",
      width: "100%",
      height: "100%",
      dataFormat: "json",
      dataSource
    }).render();
  });
  