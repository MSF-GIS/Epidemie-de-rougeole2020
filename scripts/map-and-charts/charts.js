let chart1 = null
let chart2 = null

function makeCharts(timesChart1, attack_dataset, cases_dataset, timesChart2, lethality_dataset, death_dataset,selectCase,selectDeath,selectAttack,selectLethality) {
	let pointRadius = 0
	let borderWidth = 0
	if (analyser.time_mode == 'year') {
		pointRadius = 3
		borderWidth = 3
	} else if (analyser.time_mode == 'month') {
		pointRadius = 2
		borderWidth = 2
	} else if (analyser.time_mode == 'week') {
		pointRadius = 1
		borderWidth = 1
	} else if (analyser.time_mode == 'day') {
		pointRadius = 0.5
		borderWidth = 0.5
	}
	// Destroy Charts if they already exist
	if (chart1 != null){
      chart1.destroy();
  }
	if (chart2 != null){
      chart2.destroy();
  }

	let chartData1
	let chartData2
	if (selectCase || selectAttack) {
		$('.firstChart').show()
		if (selectCase && selectAttack) {
			$('#chart-title1').html('Cases and Attack rate')
			$("#chart-legend1").attr('src', 'static/img/attack_cases.png');
			chartData1 = {
					labels: timesChart1,
					datasets: [{
						type: 'line',
						label: "Attack Rate",
						borderColor: '#070C0F',
						pointBackgroundColor: '#070C0F',
						borderWidth: borderWidth,
						pointRadius: pointRadius,
						lineTension:0,
						fill: false,
						data: attack_dataset,
						yAxisID: 'y-axis-2',
					}, {
						type: 'bar',
						label: 'Cases',
						backgroundColor: '#FF5A5F',
						data: cases_dataset,
						yAxisID: 'y-axis-1',
						borderColor: '#FF5A5F',
						borderWidth: 2
					}]
				}
		} else if (selectCase && !selectAttack) {
			$('#chart-title1').html('Cases')
			$("#chart-legend1").attr('src', 'static/img/cases.png');
			chartData1 = {
					labels: timesChart1,
					datasets: [{
						type: 'bar',
						label: 'Cases',
						backgroundColor: '#FF5A5F',
						data: cases_dataset,
						yAxisID: 'y-axis-1',
						borderColor: '#FF5A5F',
						borderWidth: 2
					}]
				}
		} else if (!selectCase && selectAttack) {
			$('#chart-title1').html('Attack rate')
			$("#chart-legend1").attr('src', 'static/img/attack.png');
			chartData1 = {
					labels: timesChart1,
					datasets: [{
						type: 'line',
						label: "Attack Rate",
						borderColor: '#070C0F',
						pointBackgroundColor: '#070C0F',
						borderWidth: borderWidth,
						pointRadius: pointRadius,
						lineTension:0,
						fill: false,
						data: attack_dataset,
						yAxisID: 'y-axis-2',
					}]
				}
		}
	} else {
		$('.firstChart').hide()
	}

	if (selectDeath || selectLethality) {
		$('.secondChart').show()
		if (selectDeath && selectLethality) {
			$('#chart-title2').html('Deaths and Lethality rate')
			$("#chart-legend2").attr('src', 'static/img/lethality_deaths.png');
			chartData2 = {
					labels: timesChart2,
					datasets: [{
						type: 'line',
						label: 'Lethality Rate',
						borderColor: '#070C0F',
						pointBackgroundColor: '#070C0F',
						borderWidth: borderWidth,
						pointRadius: pointRadius,
						lineTension:0,
						fill: false,
						data: lethality_dataset,
						yAxisID: 'y-axis-2',
					}, {
						type: 'bar',
						label: 'Deaths',
						backgroundColor: '#FF5A5F',
						data: death_dataset,
						yAxisID: 'y-axis-1',
						borderColor: '#FF5A5F',
						borderWidth: 2
					}]
				}
		} else if (!selectDeath && selectLethality) {
			$('#chart-title2').html('Lethality rate')
			$("#chart-legend2").attr('src', 'static/img/lethality.png');
			chartData2 = {
					labels: timesChart2,
					datasets: [{
						type: 'line',
						label: 'Lethality Rate',
						borderColor: '#070C0F',
						pointBackgroundColor: '#070C0F',
						borderWidth: borderWidth,
						pointRadius: pointRadius,
						lineTension:0,
						fill: false,
						data: lethality_dataset,
						yAxisID: 'y-axis-2',
					}]
				}
		} else if (selectDeath && !selectLethality) {
			$('#chart-title2').html('Deaths')
			$("#chart-legend2").attr('src', 'static/img/deaths.png');
			chartData2 = {
					labels: timesChart2,
					datasets: [{
						type: 'bar',
						label: 'Deaths',
						backgroundColor: '#FF5A5F',
						data: death_dataset,
						yAxisID: 'y-axis-1',
						borderColor: '#FF5A5F',
						borderWidth: 2
					}]
				}
		}
	} else {
		$('.secondChart').hide()
	}

	const ctx = document.getElementById('chart1').getContext('2d');
	chart1 = new Chart(ctx, {
		type: 'bar',
		data: chartData1,
		options: {
      responsive: true,
      maintainAspectRatio: false,
			// title: {
			// 	display: true,
			// 	text: "Cas et taux d'attaque"
			// },
			legend: {
				display: false
			},
			scales: {
				yAxes: [{
					type: 'linear',
					display: selectCase,
					position: 'right',
					id: 'y-axis-1',
					scaleLabel: {
		        display: true,
		        labelString: 'Cases'
		      }
				}, {
					type: 'linear',
					display: selectAttack,
					position: 'left',
					id: 'y-axis-2',
					scaleLabel: {
		        display: true,
		        labelString: "Attack Rate"
		      },
					// grid line settings
					gridLines: {
						drawOnChartArea: false, // only want the grid lines for one axis to show up
					},
				}],
				xAxes: [{
            categoryPercentage: 1.0,
            barPercentage: 1.0
        }]
			},
			tooltips: {
				mode: 'index',
				intersect: true
			}
		}
	});

  const ctx2 = document.getElementById('chart2').getContext('2d');
	chart2 = new Chart(ctx2, {
		type: 'bar',
		data: chartData2,
		options: {
			responsive: true,
      maintainAspectRatio: false,
			// title: {
			// 	display: true,
			// 	text: "Décès et létalité"
			// },
			legend: {
				display: false
			},
			scales: {
				yAxes: [{
					type: 'linear',
					display: selectDeath,
					position: 'right',
					id: 'y-axis-1',
					scaleLabel: {
		        display: true,
		        labelString: "Deaths"
		      }
				}, {
					type: 'linear',
					display: selectLethality,
					position: 'left',
					id: 'y-axis-2',
					scaleLabel: {
		        display: true,
		        labelString: "Lethality Rate"
		      },

					// grid line settings
					gridLines: {
						drawOnChartArea: false, // only want the grid lines for one axis to show up
					},
				}],
				xAxes: [{
            categoryPercentage: 1.0,
            barPercentage: 1.0
        }]
			},
			tooltips: {
				mode: 'index',
				intersect: true
			}
		}
	})
}

// Global Variable used for store dynamic datatable
let dataTable = null
function fillDataTable(){
	if (dataTable != null) {
		dataTable.destroy()
	}
	$('#table-area-title').html(`${capitalize(config.geography[analyser.geo_mode].name)}`)
	const name = (analyser.indicator == 'case' || analyser.indicator == 'death') ? capitalize(analyser.indicator)+'s' : capitalize(analyser.indicator)+' Rate'
	$('#table-disease-title').html(name)
	$("#table-body").html('')
	if (analyser.mapDataSet.length > 0) {
		for (let p of analyser[`${analyser.geo_mode}places`]) {
			// let match = false
			for (let i of analyser.mapDataSet) {
				if (p.pcode == i.pcode) {
					match = true
					const chain = `<tr>
						<td>${capitalize(p.name)}</td>
						<td>${analyser.indicator != 'attack' ? i.result : Math.round((i.result / i.occurence)*100000)/100000}</td>
					</tr>`
					$("#table-body").append(chain)
				}
			}
			// if (!match) {
			// 	const chain = `<tr>
			// 		<td>${capitalize(p.name)}</td>
			// 		<td></td>
			// 	</tr>`
			// 	$("#table-body").append(chain)
			// }
		}
		dataTable = $('#table-data').DataTable({
        "order": [[ 1, "desc" ]]
    });
	} else {
		$("#table-body").html('<tr><td colspan=2>No result<td></tr>')
	}
}
