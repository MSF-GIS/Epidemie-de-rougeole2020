const analyser = {
  sliderMode: 'Range',
  time_mode: 'month',
  time_range: [],
  start_time: {},
  end_time: {},
  geo_mode: 'level2',
  area_list: ['*'],
  disease: 'mgt',
  indicator: 0,
  //If this parameter is set to True, a sql request will return the max value for this disease, setted to false after the first call
  change_disease: true,
  // This parameter determine max proportionnal circle radius, it is changed each time a new disease is selected
  disease_MaxValue: 0,
  noDataColor: '#bff5f5',
  circleMaxRadius: 100,
  circleFill: '#e91625',
  circleContour: '#000',
  swatchsFill:{},
  tresholds: {},
  mapDataSet:[],
  chartsDataSet: [],
  selectRangeMapData(){
    const diseaseColumn = this.disease+'_'+this.indicator
    let geoColumn = this.geo_mode+'_pcode'
    let sqlRequest
    if (this.indicator != 'lethality') {
      sqlRequest = `SELECT SUM(${diseaseColumn}) AS result, COUNT(${diseaseColumn}) AS occurence, ${geoColumn} AS pcode FROM epidata WHERE ${diseaseColumn} IS NOT NULL`
    } else {
      sqlRequest = `SELECT SUM(${this.disease}_case) AS cases, SUM(${this.disease}_death) AS deaths, COUNT(${this.disease}_case) AS occurence, ${geoColumn} AS pcode FROM epidata WHERE ${this.disease}_case IS NOT NULL`
    }

    // TIME clause
    if (this.time_mode == 'year') {
      sqlRequest += ` AND (year >= ${this.start_time['year']} AND year <= ${this.end_time['year']})`
    } else if (this.time_mode == 'month') {
      // Get filtered months for first and last year, and all the months for intermediate years
      sqlRequest += ` AND ((year = ${this.start_time['year']} AND month >= ${this.start_time['month']})`
      const range = this.end_time['year'] - this.start_time['year']
      if (range > 0) {
        let year = this.start_time['year']
        for (var i = 0; i < range-1; i++) {
          year += 1
          sqlRequest += ` OR (year = ${year})`
        }
        sqlRequest += ` OR (year = ${this.end_time['year']} AND month <= ${this.end_time['month']}))`
      } else {
        sqlRequest += ` AND (year = ${this.end_time['year']} AND month <= ${this.end_time['month']}))`
      }

    } else if (this.time_mode === 'week') {
      // Get filtered weeks for first and last year, and all the weeks for intermediate years
      sqlRequest += ` AND ((year = ${this.start_time['year']} AND week >= ${this.start_time['week']})`
      const range = this.end_time['year'] - this.start_time['year']
      if (range > 0) {
        let year = this.start_time['year']
        for (var i = 0; i < range-1; i++) {
          year += 1
          sqlRequest += ` OR (year = ${year})`
        }
        sqlRequest += ` OR (year = ${this.end_time['year']} AND week <= ${this.end_time['week']}))`
      } else {
        sqlRequest += ` AND (year = ${this.end_time['year']} AND week <= ${this.end_time['week']}))`
      }
    } else if (this.time_mode === 'day') {
      // Get days higher or equal than first day for fist week and fist year
      sqlRequest += ` AND ((year = ${this.start_time['year']} AND week = ${this.start_time['week']} AND day >= ${this.start_time['day']})`
      const range = this.end_time['year'] - this.start_time['year']
      if (range > 0) {
        sqlRequest += ` OR (week > ${this.start_time['week']} AND year = ${this.start_time['year']})`
        let year = this.start_time['year']
        for (var i = 0; i < range-1; i++) {
          year += 1
          sqlRequest += ` OR (year = ${year})`
        }
        // Get days for weeks between first and last weeks for last year
        sqlRequest += ` OR (week < ${this.end_time['week']} AND year = ${this.end_time['year']})`
        // Get days for last week of last year
        sqlRequest += ` OR (day <= ${this.end_time['day']} AND week = ${this.end_time['week']} AND year = ${this.end_time['year']}))`
      } else {
        // Get days for weeks between first and last weeks for last year
        sqlRequest += ` OR (week < ${this.end_time['week']} AND year = ${this.end_time['year']})`
        // Get days for last week of last year
        sqlRequest += ` OR (day <= ${this.end_time['day']} AND week = ${this.end_time['week']} AND year = ${this.end_time['year']}))`
      }
    }


    //Location clause
    // Check if '*' is in area_list
    const allArea = contains.call(this.area_list, '*');
    // Several area are selectionned
    if (this.area_list.length > 1 && !allArea) {
      sqlRequest += ` AND ${geoColumn} IN (`
      for (let a of this.area_list) {
        sqlRequest += `'${a}',`
      }
      sqlRequest = sqlRequest.substring(0, sqlRequest.length-1)
      sqlRequest += ')'
    }
    // All area are selectionned
    else if (this.area_list.length == 1 && allArea) {
      // No spatial condition
    }
    // Only one area is selectionned
    else if (this.area_list.length == 1 && !allArea) {
      sqlRequest += ` AND ${geoColumn} LIKE '${this.area_list[0]}'`
    }

    sqlRequest += ` GROUP BY ${geoColumn}`
    const sqlResult = epibase.exec(sqlRequest)
    // Initalise default values
    let maxvalue = 0
    this.mapDataSet = []

    // Create map Dataset
    if (this.indicator != 'lethality') {
      for (let data of sqlResult) {
        //Set max value for a proportionnal circle
        if (data.result > maxvalue) {
          maxvalue = data.result
        }
        // Build the map dataset
        analyser.mapDataSet.push({
          result: data.result,
          occurence: data.occurence,
          pcode: data.pcode
        })
      }
    } else {
      let multiplier
      for (let d of config.disease) {
        if (d.code == analyser.disease) {
          for (let i in d.indicators) {
            if (i == analyser.indicator) {
              multiplier = d.indicators[i].multiplier
            }
          }
        }
      }
      for (let data of sqlResult) {
        analyser.mapDataSet.push({
          result: data.deaths == 0 ? 0 : Math.round(((data.deaths / data.cases)*multiplier)*100000)/100000,
          occurence: data.occurence,
          pcode: data.pcode
        })
      }
    }
    if (this.change_disease) {
      this.disease_MaxValue = maxvalue
    }
    //Set change_disease to false, max value for propotionnal circle are now setted for this disease
    this.change_disease = false
    this.selectChartsData()
  },
  selectChartsData(){
    const diseaseColumn = this.indicator != 'lethality' ? this.disease+'_'+this.indicator : this.disease+'_case'
    let geoColumn = this.geo_mode+'_pcode'
    let timeColumn = this.time_mode
    let selectCase = selectDeath = selectAttack = selectLethality = false
    let sqlRequest = `SELECT `
    let lethalityMultiplier
    if (this.time_mode == 'day') {
      sqlRequest += 'day, week,'
    }
    if (this.time_mode == 'week') {
      sqlRequest += 'week,'
    }
    if (this.time_mode == 'month') {
      sqlRequest += 'month,'
    }
    sqlRequest += ` year,`
    for (let d of config.disease) {
      if (d.code == this.disease) {
        if (d.indicators.case) {
          sqlRequest += ` SUM(${this.disease}_case) AS cases,`
          selectCase = true
        }
        if (d.indicators.death) {
          sqlRequest += ` SUM(${this.disease}_death) AS death,`
          selectDeath = true
        }
        if (d.indicators.attack.exist) {
          sqlRequest += ` SUM(${this.disease}_attack) AS attack,`
          selectAttack = true
        }
        if (d.indicators.lethality.exist) {
          lethalityMultiplier = d.indicators.lethality.multiplier
          selectLethality = true
        }
      }
    }
    sqlRequest += ` COUNT(${diseaseColumn}) AS occurence FROM epidata`
    sqlRequest += ` WHERE ${diseaseColumn} IS NOT NULL`
    let groupBy = ''
    let orderBy = ''
    //  TIME CLAUSE
    if (this.time_mode === "year") {
      sqlRequest += ` AND (year >= ${this.start_time['year']} AND year <= ${this.end_time['year']})`
    } else if (this.time_mode === "month") {
      sqlRequest += ` AND ((year = ${this.start_time['year']} AND month >= ${this.start_time['month']})`
      const range = this.end_time['year'] - this.start_time['year']
      if (range > 0) {
        let year = this.start_time['year']
        for (var i = 0; i < range-1; i++) {
          year += 1
          sqlRequest += ` OR (year = ${year})`
        }
        sqlRequest += ` OR (year = ${this.end_time['year']} AND month <= ${this.end_time['month']}))`
      } else {
        sqlRequest += ` AND (year = ${this.end_time['year']} AND month <= ${this.end_time['month']}))`
      }
    } else if (this.time_mode === "week") {
      sqlRequest += ` AND ((year = ${this.start_time['year']} AND week >= ${this.start_time['week']})`
      const range = this.end_time['year'] - this.start_time['year']
      if (range > 0) {
        let year = this.start_time['year']
        for (var i = 0; i < range-1; i++) {
          year += 1
          sqlRequest += ` OR (year = ${year})`
        }
        sqlRequest += ` OR (year = ${this.end_time['year']} AND week <= ${this.end_time['week']}))`
      } else {
        sqlRequest += ` AND (year = ${this.end_time['year']} AND week <= ${this.end_time['week']}))`
      }
    } else if (this.time_mode === 'day') {
      // Get days higher or equal than first day for fist week and fist year
      sqlRequest += ` AND ((year = ${this.start_time['year']} AND week = ${this.start_time['week']} AND day >= ${this.start_time['day']})`
      const range = this.end_time['year'] - this.start_time['year']
      if (range > 0) {
        sqlRequest += ` OR (week > ${this.start_time['week']} AND year = ${this.start_time['year']})`
        let year = this.start_time['year']
        for (var i = 0; i < range-1; i++) {
          year += 1
          sqlRequest += ` OR (year = ${year})`
        }
        // Get days for weeks between first and last weeks for last year
        sqlRequest += ` OR (week < ${this.end_time['week']} AND year = ${this.end_time['year']})`
        // Get days for last week of last year
        sqlRequest += ` OR (day <= ${this.end_time['day']} AND week = ${this.end_time['week']} AND year = ${this.end_time['year']}))`
      } else {
        // Get days for weeks between first and last weeks for last year
        sqlRequest += ` OR (week < ${this.end_time['week']} AND week > ${this.start_time['week']} AND year = ${this.end_time['year']})`
        // Get days for last week of last year
        sqlRequest += ` OR (day <= ${this.end_time['day']} AND week = ${this.end_time['week']} AND year = ${this.end_time['year']}))`
      }
    }

    // Check if '*' is in area_list
    const allArea = contains.call(this.area_list, '*');
    // Several area are selectionned
    if (this.area_list.length > 1 && !allArea) {
      sqlRequest += ` AND ${geoColumn} IN (`
      for (let a of this.area_list) {
        sqlRequest += `'${a}',`
      }
      sqlRequest = sqlRequest.substring(0, sqlRequest.length-1)
      sqlRequest += ')'
    }
    // All area are selectionned
    else if (this.area_list.length == 1 && allArea) {
      // No spatial condition
    }
    // Only one area is selectionned
    else if (this.area_list.length == 1 && !allArea) {
      sqlRequest += ` AND ${geoColumn} LIKE '${this.area_list[0]}'`
    }

    // GROUP AND ORDER
    if (this.time_mode === "year") {
      sqlRequest += ' GROUP BY year'
      sqlRequest += ' ORDER BY year'
    } else if (this.time_mode === "month") {
      sqlRequest += ' GROUP BY month, year'
      sqlRequest += ' ORDER BY year, month'
    } else if (this.time_mode === "week") {
      sqlRequest += ' GROUP BY week, month, year'
      sqlRequest += ' ORDER BY year, month, week'
    } else if (this.time_mode === "day") {
      sqlRequest += ' GROUP BY day, week, month, year'
      sqlRequest += ' ORDER BY year, month, week, time'
    }
    const sqlResult = epibase.exec(sqlRequest)
    this.chartsDataSet = []
    $.each(sqlResult, function(i, data){
      // Build the chart dataset
      analyser.chartsDataSet.push({
        day: data.day || null,
        week: data.week || null,
        month: data.month || null,
        year: data.year,
        cases: (data.cases || data.cases === 0) ? data.cases : null,
        death: (data.death || data.death === 0) ? data.death : null,
        attack: (data.attack || data.attack === 0) ? data.attack : null,
        lethality: selectLethality ? (data.death == 0 ? 0 : (data.death / data.cases)*lethalityMultiplier) : null,
        occurence: data.occurence
      })
    })
    // Create Charts Datasets and make charts
    let labels1 = [], labels2 = [], attack_dataset = [], cases_dataset = [], death_dataset = [], lethality_dataset = []
    $.each(this.chartsDataSet, function(i, v) {
      if (analyser.time_mode == 'year') {
        labels1.push(v['year'])
        labels2.push(v['year'])
      } else if (analyser.time_mode == 'month') {
        labels1.push(numb2Month[v['month']]+' '+v['year'])
        labels2.push(numb2Month[v['month']]+' '+v['year'])
      } else if (analyser.time_mode == 'week') {
        labels1.push('Week '+v['week']+' - '+v['year'])
        labels2.push('Week '+v['week']+' - '+v['year'])
      } else if (analyser.time_mode == 'day') {
        labels1.push(dbDayToDate(v['day'],v['week'],v['year']))
        labels2.push(dbDayToDate(v['day'],v['week'],v['year']))
      }
      cases_dataset.push(v['cases'])
      death_dataset.push(v['death'])
      attack_dataset.push(Math.round((v['attack'] / v['occurence'])*100000)/100000)
      lethality_dataset.push(Math.round(v['lethality']*100000)/100000)
    })
    // Change chart height if one or two charts
    if ((!selectCase && !selectAttack) || (!selectDeath && !selectLethality)) {
      $(".chartDiv").css("height", "64vh");
    } else {
      $(".chartDiv").css("height", "32vh");
    }
    this.loadMapData()
    makeCharts(labels1, attack_dataset, cases_dataset, labels2, lethality_dataset, death_dataset,selectCase,selectDeath,selectAttack,selectLethality)
  },
  selectUniqueMapData(){
    const diseaseColumn = this.disease+'_'+this.indicator
    let geoColumn = this.geo_mode+'_pcode'
    let sqlRequest
    if (this.indicator != 'lethality') {
      sqlRequest = `SELECT SUM(${diseaseColumn}) AS result, COUNT(${diseaseColumn}) AS occurence, ${geoColumn} AS pcode FROM epidata WHERE ${diseaseColumn} IS NOT NULL`
    } else {
      sqlRequest = `SELECT SUM(${this.disease}_case) AS cases, SUM(${this.disease}_death) AS deaths, COUNT(${this.disease}_case) AS occurence, ${geoColumn} AS pcode FROM epidata WHERE ${this.disease}_case IS NOT NULL`
    }

    if (this.time_mode == 'year') {
      sqlRequest += ` AND year = ${this.start_time['year']}`
    } else if (this.time_mode == 'month') {
      sqlRequest += ` AND year = ${this.start_time['year']} AND month = ${this.start_time['month']}`
    } else if (this.time_mode == 'week') {
      sqlRequest += ` AND year = ${this.start_time['year']} AND week = ${this.start_time['week']}`
    } else if (this.time_mode == 'day') {
      sqlRequest += ` AND year = ${this.start_time['year']} AND week = ${this.start_time['week']} AND day = ${this.start_time['day']}`
    }

    //Location clause
    // Check if '*' is in area_list
    const allArea = contains.call(this.area_list, '*');
    // Several area are selectionned
    if (this.area_list.length > 1 && !allArea) {
      sqlRequest += ` AND ${geoColumn} IN (`
      for (let a of this.area_list) {
        sqlRequest += `'${a}',`
      }
      sqlRequest = sqlRequest.substring(0, sqlRequest.length-1)
      sqlRequest += ')'
    }
    // All area are selectionned
    else if (this.area_list.length == 1 && allArea) {
      // No spatial condition
    }
    // Only one area is selectionned
    else if (this.area_list.length == 1 && !allArea) {
      sqlRequest += ` AND ${geoColumn} LIKE '${this.area_list[0]}'`
    }

    sqlRequest += ` GROUP BY ${geoColumn}`

    const sqlResult = epibase.exec(sqlRequest)
    // Initalise default values
    let maxvalue = 0
    this.mapDataSet = []

    if (this.indicator != 'lethality') {
      for (let data of sqlResult) {
        //Set max value for a proportionnal circle
        if (data.result > maxvalue) {
          maxvalue = data.result
        }
        // Build the map dataset
        analyser.mapDataSet.push({
          result: data.result,
          occurence: data.occurence,
          pcode: data.pcode
        })
      }
    } else {
      let multiplier
      for (let d of config.disease) {
        if (d.code == analyser.disease) {
          for (let i in d.indicators) {
            if (i == analyser.indicator) {
              multiplier = d.indicators[i].multiplier
            }
          }
        }
      }
      for (let data of sqlResult) {
        analyser.mapDataSet.push({
          result: data.deaths == 0 ? 0 : Math.round(((data.deaths / data.cases)*multiplier)*100000)/100000,
          pcode: data.pcode
        })
      }
    }
    if (this.change_disease) {
      this.disease_MaxValue = maxvalue
    }
    //Set change_disease to false, max value for propotionnal circle are now setted for this disease
    this.change_disease = false
    this.loadMapData()
    fillDataTable()
  },
  loadMapData(){
    // Change layer on the map
    boundarieslayers.eachLayer(function(layer){
      if (mymap.hasLayer(layer)) {
        mymap.removeLayer(layer)
      }
    })
    eval(this.geo_mode+'Layer.addTo(mymap)')
    // Get tresholds and colors for map representation
    let colors, tresholds
    for (let d of config.disease) {
      if (d.code == analyser.disease) {
        for (let i in d.indicators) {
          if (i == analyser.indicator) {
            colors = d.indicators[i].colors
            tresholds = d.indicators[i].tresholds
          }
        }
      }
    }
    // Set min/max of dataset for circles legend
    legend.circles.min = Infinity
    legend.circles.max = -Infinity
    $.each(this.mapDataSet, function(i,v){
      if (v['result'] < legend.circles.min) {
        legend.circles.min = parseInt(v['result'])
      }
      if (v['result'] > legend.circles.max) {
        legend.circles.max = parseInt(v['result'])
      }
    })
    // Call Mapper method to display data
    if (this.indicator == 'case' || this.indicator == 'death') {
      Mapper.displayCaseOrDeath(this.mapDataSet, this.disease_MaxValue)
    } else if (this.indicator == 'attack' || this.indicator == 'lethality') {
      Mapper.displayMortalityOrAttack(this.mapDataSet, tresholds, colors)
    }
    legend.setLegend(tresholds, colors)
  }
}

// Watch for changes on the analyser object
function watchAnalyser(){
  watch(analyser, ["geo_mode", "time_range", "indicator", "circleMaxRadius", 'circleFill', 'circleContour'], function(){
    analyser.sliderMode == 'Range' ? analyser.selectRangeMapData() : analyser.selectUniqueMapData()
  })
}

function reloadAnalyse(){
  analyser.sliderMode == 'Range' ? analyser.selectRangeMapData() : analyser.selectUniqueMapData()
}
