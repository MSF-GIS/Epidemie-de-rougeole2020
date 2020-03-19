// DEFINE A GLOBAL VARIABLE FOR EPIMAP DATABASE
let epibase
// DEFINE A GLOBAL VARIABLE FOR SLIDER MODE
let slider
// LAUNCH INITIALISATION
initApp()

async function initApp(){
  // Set legend colors
  const divs = document.getElementsByClassName('treshold-square');
  for(i = 0; i < divs.length; i++) {
    divs[i].style.backgroundColor = config.mapping.no_data;
  }

  // CREATE GEOGRAPHIC LAYERS
  if (config.geography.level1.exist) {
    const data = await getLevel1()
    level1Layer = L.geoJson(data, {
        style: myStyle,
        onEachFeature: MapInteraction
    });
    boundarieslayers.addLayer(level1Layer)
    analyser.level1places = []
    level1Layer.eachLayer(l => {
      analyser.level1places.push({
        name: l.feature.properties.name,
        pcode: l.feature.properties.pcode
      })
    })
  }
  if (config.geography.level2.exist) {
    const data = await getLevel2()
    level2Layer = L.geoJson(data, {
        style: myStyle,
        onEachFeature: MapInteraction
    });
    boundarieslayers.addLayer(level2Layer)
    analyser.level2places = []
    level2Layer.eachLayer(l => {
      analyser.level2places.push({
        name: l.feature.properties.name,
        pcode: l.feature.properties.pcode
      })
    })
  }
  if (config.geography.level3.exist) {
    const data = await getLevel3()
    level3Layer = L.geoJson(data, {
        style: myStyle,
        onEachFeature: MapInteraction
    });
    boundarieslayers.addLayer(level3Layer)
    analyser.level3places = []
    level3Layer.eachLayer(l => {
      analyser.level3places.push({
        name: l.feature.properties.name,
        pcode: l.feature.properties.pcode
      })
    })
  }
  // if (config.geography.level4.exist) {
  //   const data = await getLevel4()
  //   level4Layer = L.geoJson(data, {
  //       style: myStyle,
  //       onEachFeature: MapInteraction
  //   });
  //   boundarieslayers.addLayer(level4Layer)
    // analyser.level4places = []
    // level4Layer.eachLayer(l => {
    //   analyser.level4places.push({
    //     name: l.feature.properties.name,
    //     pcode: l.feature.properties.pcode
    //   })
    // })
  // }
  //GET THE APPLICATION CONFIGURATION
  // Set Tresholds for swatchs
  // for (let d of config.disease) {
  //   if (d.indicators.attack.exist) {
  //     analyser.tresholds[d.code+'_attack'] = d.indicators.attack.treshold
  //   }
  //   if (d.indicators.lethality.exist) {
  //     analyser.tresholds[d.code+'_lethality'] = d.indicators.lethality.treshold
  //   }
  // }
  // Set radius/Colors for circles
  analyser.circleFill = config.mapping.circles_fill
  analyser.circleContour = config.mapping.circles_contour
  analyser.circleMaxRadius = config.mapping.circles_radius

  // CONFIGURE GEOGRAPHIC SELECTOR AND SET SELECTOR TO DEFAULT SELECTION DEFINED BY INIT_AREA PARAMETER
  // CONFIGURE ALASQL DB COLUMNS
  const alasqlConfig = {
    epidata_request: 'CREATE TABLE epidata (id serial PRIMARY KEY NOT NULL',
    epidata_insert: 'INSERT INTO epidata (id',
    day_range_request: false,
    week_range_request: false,
    month_range_request: false,
    year_range_request:false,
    disease: [],
    cases: false,
    deces: false,
    attack: false,
    lethality: false,
    vaccination: false,
    init: true
  }
  // Initialise selectors and complete SQL request
  $('#app-subtitle').html(config.name)
  let areaString = ''
  if (config.geography.level1.exist && config.initialisation.geography == 'level1') {
    areaString += '<option selected value="level1">'+config.geography.level1.name+'s</option>'
    alasqlConfig.epidata_request += ', level1_name STRING, level1_pcode STRING'
    alasqlConfig.epidata_insert += ', level1_name, level1_pcode'
  } else if (config.geography.level1.exist) {
    areaString += '<option value="level1">'+config.geography.level1.name+'s</option>'
    alasqlConfig.epidata_request += ', level1_name STRING, level1_pcode STRING'
    alasqlConfig.epidata_insert += ', level1_name, level1_pcode'
  }
  if (config.geography.level2.exist && config.initialisation.geography == 'level2') {
    areaString += '<option selected value="level2">'+config.geography.level2.name+'s</option>'
    alasqlConfig.epidata_request += ', level2_name STRING, level2_pcode STRING'
    alasqlConfig.epidata_insert += ', level2_name, level2_pcode'
  } else if (config.geography.level2.exist) {
    areaString += '<option value="level2">'+config.geography.level2.name+'s</option>'
    alasqlConfig.epidata_request += ', level2_name STRING, level2_pcode STRING'
    alasqlConfig.epidata_insert += ', level2_name, level2_pcode'
  }
  if (config.geography.level3.exist && config.initialisation.geography == 'level3') {
    areaString += '<option selected value="level3">'+config.geography.level3.name+'s</option>'
    alasqlConfig.epidata_request += ', level3_name STRING, level3_pcode STRING'
    alasqlConfig.epidata_insert += ', level3_name, level3_pcode'
  }else if (config.geography.level3.exist) {
    areaString += '<option value="level3">'+config.geography.level3.name+'s</option>'
    alasqlConfig.epidata_request += ', level3_name STRING, level3_pcode STRING'
    alasqlConfig.epidata_insert += ', level3_name, level3_pcode'
  }
  // if (config.geography.level4.exist && config.initialisation.geography == 'level4') {
  //   areaString += '<option selected value="level4">'+config.geography.level4.name+'</option>'
  //   alasqlConfig.epidata_request += ', level4_name STRING, level4_pcode STRING'
  //   alasqlConfig.epidata_insert += ', level4_name, level4_pcode'
  // } else if (config.geography.level4.exist) {
  //   areaString += '<option value="level4">'+config.geography.level4.name+'</option>'
  //   alasqlConfig.epidata_request += ', level4_name STRING, level4_pcode STRING'
  //   alasqlConfig.epidata_insert += ', level4_name, level4_pcode'
  // }
  $('#secteur').selectpicker('destroy')
  $('#secteur').html(areaString)
  $('#secteur').selectpicker();

  // CONFIGURE TIME SELECTOR AND SET SELECTOR TO DEFAULT SELECTION
  let timeString = ''
  if (config.time.year && config.initialisation.time == 'year') {
    timeString += '<option selected value="year">Years</option>'
    alasqlConfig.epidata_request += ', year INT'
    alasqlConfig.epidata_insert += ', year'
    alasqlConfig.year_range_request = true
  } else if (config.time.year) {
    timeString += '<option value="year">Years</option>'
    alasqlConfig.epidata_request += ', year INT'
    alasqlConfig.epidata_insert += ', year'
    alasqlConfig.year_range_request = true
  }
  if (config.time.month && config.initialisation.time == 'month') {
    timeString += '<option selected value="month">Months</option>'
    alasqlConfig.epidata_request += ', month INT'
    alasqlConfig.epidata_insert += ', month'
    alasqlConfig.month_range_request = true
  } else if (config.time.month) {
    timeString += '<option value="month">Months</option>'
    alasqlConfig.epidata_request += ', month INT'
    alasqlConfig.epidata_insert += ', month'
    alasqlConfig.month_range_request = true
  }
  if (config.time.week && config.initialisation.time == 'week') {
    timeString += '<option selected value="week">Weeks</option>'
    alasqlConfig.epidata_request += ', week INT'
    alasqlConfig.epidata_insert += ', week'
    alasqlConfig.week_range_request = true
  } else if (config.time.week) {
    timeString += '<option value="week">Weeks</option>'
    alasqlConfig.epidata_request += ', week INT'
    alasqlConfig.epidata_insert += ', week'
    alasqlConfig.week_range_request = true
  }
  if (config.time.day && config.initialisation.time == 'day') {
    timeString += '<option selected value="day">Days</option>'
    alasqlConfig.epidata_request += ', day INT'
    alasqlConfig.epidata_insert += ', day'
    alasqlConfig.day_range_request = true
  } else if (config.time.day) {
    timeString += '<option value="day">Days</option>'
    alasqlConfig.epidata_request += ', day INT'
    alasqlConfig.epidata_insert += ', day'
    alasqlConfig.day_range_request = true
  }
  alasqlConfig.epidata_request += ', '
  alasqlConfig.epidata_insert += ', '
  $('#intervalle').selectpicker('destroy')
  $('#intervalle').html(timeString)
  $('#intervalle').selectpicker();

  // CONFIGURE DISEASE SELECTOR AND SET SELECTOR TO DEFAULT SELECTION
  let diseaseString = ''
  let indicatorString = ''
  for (let d of config.disease) {
    if (config.initialisation.disease == d.code) {
      diseaseString += `<option selected value="${d.code}">${d.name}</option>`
    } else {
      diseaseString += `<option value="${d.code}">${d.name}</option>`
    }
    if (d.indicators.case) {
      alasqlConfig.epidata_request += `${d.code}_case FLOAT, `
      alasqlConfig.epidata_insert += `${d.code}_case, `
      alasqlConfig.disease.push(`${d.code}_case`)
    }
    if (d.indicators.death) {
      alasqlConfig.epidata_request += `${d.code}_death FLOAT, `
      alasqlConfig.epidata_insert += `${d.code}_death, `
      alasqlConfig.disease.push(`${d.code}_death`)
    }
    if (d.indicators.attack.exist) {
      alasqlConfig.epidata_request += `${d.code}_attack FLOAT, `
      alasqlConfig.epidata_insert += `${d.code}_attack, `
      alasqlConfig.disease.push(`${d.code}_attack`)
    }
    // if (d.indicators.lethality.exist) {
    //   alasqlConfig.epidata_request += `${d.code}_lethality FLOAT, `
    //   alasqlConfig.epidata_insert += `${d.code}_lethality, `
    //   alasqlConfig.disease.push(`${d.code}_lethality`)
    // }
  }
  $('#disease').selectpicker('destroy')
  $('#disease').html(diseaseString)
  $('#disease').selectpicker();

  alasqlConfig.epidata_request = alasqlConfig.epidata_request.substring(0,alasqlConfig.epidata_request.length-2)
  alasqlConfig.epidata_insert = alasqlConfig.epidata_insert.substring(0,alasqlConfig.epidata_insert.length-2)
  alasqlConfig.epidata_request += ')'
  alasqlConfig.epidata_insert +=') values '

  // Create SQL Database
  epibase = new alasql.Database('epibase');
  epibase.exec(alasqlConfig.epidata_request)

  //Extract CSV datas and insert into SQLDB, then configure the "slider" object
  // Insert values by 5000 groups to avoid multiple insert statements or a unique heavy insert
  alasql.promise('SELECT * FROM CSV("data/dataset.csv", {headers:true})').then(data => {
    let tempRequest = ""
    data.forEach((d,i) => {
      let insert_values_request = '('
      insert_values_request += i+', '
      if (config.geography.level1.exist) {
        insert_values_request += '"'+d["level1_name"]+'", "'+d["level1_pcode"]+'", '
      }
      if (config.geography.level2.exist) {
        insert_values_request += '"'+d["level2_name"]+'", "'+d["level2_pcode"]+'", '
      }
      if (config.geography.level3.exist) {
        insert_values_request += '"'+d["level3_name"]+'", "'+d["level3_pcode"]+'", '
      }
      // if (config.geography.level4.exist) {
      //   insert_values_request += '"'+d["level4_name"]+'", "'+d["level4_pcode"]+'", '
      // }
      if (config.time.year) {
        insert_values_request += d["year"]+', '
      }
      if (config.time.month) {
        insert_values_request += d["month"]+', '
      }
      if (config.time.week) {
        insert_values_request += d["week"]+', '
      }
      if (config.time.day) {
        insert_values_request += d["day"]+', '
      }
      for (let dse of alasqlConfig.disease) {
        if (d[dse].length == 0) {
          d[dse] = 'NULL'
        }
        insert_values_request += d[dse]+', '
      }
      insert_values_request = insert_values_request.substring(0, insert_values_request.length-2);
      insert_values_request += '), '
      tempRequest += insert_values_request
      if (i % 5000 == 0 && i > 0) {
        tempRequest = tempRequest.substring(0, tempRequest.length-2);
        epibase.exec(alasqlConfig.epidata_insert+tempRequest)
        tempRequest = ''
      }
    })
    tempRequest = tempRequest.substring(0, tempRequest.length-2);
    epibase.exec(alasqlConfig.epidata_insert+tempRequest)

    if (alasqlConfig.day_range_request) {
      let createRequest = 'CREATE TABLE day_range (id serial PRIMARY KEY NOT NULL,'
      let insertRequest = 'INSERT INTO day_range ('
      let selectRequest = 'SELECT DISTINCT '
      let groupRequest = 'ORDER BY '
      if (config.time.year) {
        createRequest += 'year INT,'
        insertRequest += 'year,'
        selectRequest += 'year,'
        groupRequest += 'year,'
      }
      if (config.time.month) {
        createRequest += 'month INT,'
        insertRequest += 'month,'
        selectRequest += 'month,'
        groupRequest += 'month,'
      }
      if (config.time.week) {
        createRequest += 'week INT,'
        insertRequest += 'week,'
        selectRequest += 'week,'
        groupRequest += 'week,'
      }
      createRequest += 'day INT)'
      insertRequest += 'day) '
      selectRequest += 'day FROM epidata '
      groupRequest += 'day'
      epibase.exec(createRequest);
      epibase.exec(insertRequest+selectRequest+groupRequest)
      rangeSlider.day_list = epibase.exec('SELECT * FROM day_range');
      uniqueSlider.day_list = epibase.exec('SELECT * FROM day_range');
      const days = epibase.exec('SELECT MIN(id) AS min, MAX(id) AS max FROM day_range');
      rangeSlider.default_day_start.push(days[0]['min'], days[0]['max'])
      rangeSlider.day_range = days[0];
      uniqueSlider.default_day_start.push(days[0]['min'], days[0]['max'])
      uniqueSlider.day_range = days[0];
    }
    if (alasqlConfig.week_range_request) {
      let createRequest = 'CREATE TABLE week_range (id serial PRIMARY KEY NOT NULL,'
      let insertRequest = 'INSERT INTO week_range ('
      let selectRequest = 'SELECT DISTINCT '
      let groupRequest = 'ORDER BY '
      if (config.time.year) {
        createRequest += 'year INT,'
        insertRequest += 'year,'
        selectRequest += 'year,'
        groupRequest += 'year,'
      }
      if (config.time.month) {
        createRequest += 'month INT,'
        insertRequest += 'month,'
        selectRequest += 'month,'
        groupRequest += 'month,'
      }
      createRequest += 'week INT)'
      insertRequest += 'week) '
      selectRequest += 'week FROM epidata '
      groupRequest += 'week'
      epibase.exec(createRequest);
      epibase.exec(insertRequest+selectRequest+groupRequest)
      rangeSlider.week_list = epibase.exec('SELECT * FROM week_range');
      uniqueSlider.week_list = epibase.exec('SELECT * FROM week_range');
      const weeks = epibase.exec('SELECT MIN(id) AS min, MAX(id) AS max FROM week_range');
      rangeSlider.default_week_start.push(weeks[0]['min'], weeks[0]['max'])
      rangeSlider.week_range = weeks[0];
      uniqueSlider.default_week_start.push(weeks[0]['min'], weeks[0]['max'])
      uniqueSlider.week_range = weeks[0];
    }
    if (alasqlConfig.month_range_request) {
      let createRequest = 'CREATE TABLE month_range (id serial PRIMARY KEY NOT NULL,'
      let insertRequest = 'INSERT INTO month_range ('
      let selectRequest = 'SELECT DISTINCT '
      let groupRequest = 'ORDER BY '
      if (config.time.year) {
        createRequest += 'year INT,'
        insertRequest += 'year,'
        selectRequest += 'year,'
        groupRequest += 'year,'
      }
      createRequest += 'month INT)'
      insertRequest += 'month) '
      selectRequest += 'month FROM epidata '
      groupRequest += 'month'
      epibase.exec(createRequest);
      epibase.exec(insertRequest+selectRequest+groupRequest)
      rangeSlider.month_list = epibase.exec('SELECT * FROM month_range');
      uniqueSlider.month_list = epibase.exec('SELECT * FROM month_range');
      const months = epibase.exec('SELECT MIN(id) AS min, MAX(id) AS max FROM month_range');
      rangeSlider.default_month_start.push(months[0]['min'], months[0]['max'])
      rangeSlider.month_range = months[0];
      uniqueSlider.default_month_start.push(months[0]['min'], months[0]['max'])
      uniqueSlider.month_range = months[0];
    }
    if (alasqlConfig.year_range_request) {
      epibase.exec('CREATE TABLE year_range (id serial PRIMARY KEY NOT NULL, year INT)');
      epibase.exec('INSERT INTO year_range (year) SELECT DISTINCT year FROM epidata ORDER BY year')
      rangeSlider.year_list = epibase.exec('SELECT * FROM year_range');
      uniqueSlider.year_list = epibase.exec('SELECT * FROM year_range');
      const years = epibase.exec('SELECT MIN(id) AS min, MAX(id) AS max FROM year_range');
      rangeSlider.default_year_start.push(years[0]['min'], years[0]['max'])
      rangeSlider.year_range = years[0];
      uniqueSlider.default_year_start.push(years[0]['min'], years[0]['max'])
      uniqueSlider.year_range = years[0];
    }
    // INITIALISE DEFAULT SLIDER
    slider = rangeSlider

    // SET ANALYSER PROPERTIES AND SLIDER MODE
     analyser.geo_mode = config.initialisation.geography
     const time_mode = config.initialisation.time
     if (time_mode == 'year') {
       slider.year()
     } else if (time_mode == 'month') {
       slider.month()
     } else if (time_mode == 'week') {
       slider.week()
     } else if (time_mode == 'day') {
       slider.day()
     }
     analyser.time_mode = time_mode
     analyser.disease = config.initialisation.disease
     // Watch for changes on the analyser object
     watchAnalyser()
     //Set Indicator
     updateIndicator()
     // INITIALISE AREA LIST SELECTOR
     setAreaList(config.initialisation.geography)
     // Set map bounds
     eval('mymap.fitBounds('+analyser.geo_mode+'Layer.getBounds())')
     // Initialise labels Name
     $('#level_labels').html(config.geography[config.initialisation.geography].name+' labels')
     // Set infos modal
     $('#info-commentary').html(config.informations.content)
     if (config.informations.open_by_default) {
       $('#modalinfo').modal('show')
     }
     $('.overlay-loader').hide()
  })
}

async function getLevel1(){
    const data = await $.getJSON("data/level1.geojson")
    return data
}

async function getLevel2(){
    const data = await $.getJSON("data/level2.geojson")
    return data
}

async function getLevel3(){
    const data = await $.getJSON("data/level3.geojson")
    return data
}

async function getLevel4(){
    const data = await $.getJSON("data/level4.geojson")
    return data
}
