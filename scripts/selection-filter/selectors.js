// Change slider mode
$('#sliderMode').change(function() {
  if ($(this).prop('checked')) {
    slider = rangeSlider
    updateSliderByRangeValue()
    analyser.sliderMode = 'Range'
    $('.move-range-right').show()
    $('#chartsContainer').show()
    $('#tableContainer').hide()
  } else {
    slider = uniqueSlider
    updateSliderByUniqueValue()
    analyser.sliderMode = 'Unique'
    $('.move-range-right').hide()
    $('#tableContainer').show()
    $('#chartsContainer').hide()
  }
  if (analyser.time_mode === 'year') {
    slider.year()
  } else if (analyser.time_mode === 'month') {
    slider.month()
  } else if (analyser.time_mode === 'week') {
    slider.week()
  } else if (analyser.time_mode === 'day') {
    slider.day()
  }
})

// Change on area mode selector
$(document).on('change','#secteur',function(){
    const selection = $('#secteur').val()
    const text = $( "#secteur option:selected" ).text();
    $('#level_labels').html(text+' labels')
    analyser.change_disease = true
    // Intialise analyser Object
    analyser.geo_mode = selection
    analyser.area_list = ['*']
    setAreaList(selection)
});

// Change on time selector
$(document).on('change','#intervalle',function(){
    const selection = $('#intervalle').val()
    analyser.time_mode = selection
    // Change slider mode
    if (selection === 'year') {
      slider.year()
    } else if (selection === 'month') {
      slider.month()
    } else if (selection === 'week') {
      slider.week()
    } else if (selection === 'day') {
      slider.day()
    }
});

// Change on disease selector
$(document).on('change','#disease',function(){
  // Set analyser.change_disease to true to get the new max value for proportionnal circles
    analyser.change_disease = true
    analyser.disease = $('#disease').val()
    updateIndicator()
});

// Change on indicator selector
$(document).on('change','#indicator',function(){
    analyser.change_disease = true
    analyser.indicator = $('#indicator').val()
});

// Set indicators list according to disease and set analyser.indicator
function updateIndicator(){
  let diseases = []
  for (let d of config.disease) {
    if (d.code == analyser.disease) {
      if (d.indicators.case){
        diseases.push({
          d:'Cases',
          code: 'case'
        })
      }
      if (d.indicators.death){
        diseases.push({
          d:'Deaths',
          code: 'death'
        })
      }
      if (d.indicators.attack.exist){
        if (d.indicators.attack.multiplier > 1) {
          diseases.push({
            d:'Attack Rate * '+d.indicators.attack.multiplier,
            code: 'attack'
          })
        } else {
          diseases.push({
            d:'Attack Rate',
            code: 'attack'
          })
        }
      }
      if (d.indicators.lethality.exist){
        if (d.indicators.lethality.multiplier > 1) {
          diseases.push({
            d:'Lethality * '+d.indicators.lethality.multiplier,
            code: 'lethality'
          })
        } else {
          diseases.push({
            d:'Lethality',
            code: 'lethality'
          })
        }
      }
    }
  }
  let indicatorString = ''
  let newIndicator = ''
  diseases.forEach((v,i) => {
    if (i == 0) {
      indicatorString += `<option selected value="${v.code}">${v.d}</option>`
      newIndicator = v.code
    } else {
      indicatorString += `<option value="${v.code}">${v.d}</option>`
    }
  })
  // Update analyser if new indicator or launch analysis
  analyser.indicator == newIndicator ? reloadAnalyse() : analyser.indicator = newIndicator
  $('#indicator').selectpicker('destroy')
  $('#indicator').html(indicatorString)
  $('#indicator').selectpicker();
}

// Change on area list selector (Charts DIV)
let allWasSelected = true
$(document).on('change','#sectorlist',function(){
    let selection = $('#sectorlist').val()
    const allIsSelected = contains.call(selection, '*');
    // If user click on an area -> Deselect the "*" value
    if (selection.length > 1 && allIsSelected && allWasSelected) {
      allWasSelected = false
      const index = selection.indexOf('*')
      selection.splice(index, 1)
      analyser.area_list = selection
      $('#sectorlist').val(analyser.area_list)
      $('#sectorlist').selectpicker('render');
      $('#sectorlist').selectpicker('toggle');
      $('#sectorlist').selectpicker('toggle');
    }
    // If user click on "All" -> Deselect all others area
    else if (selection.length > 1 && allIsSelected  && !allWasSelected) {
      allWasSelected = true
      selection = ['*']
      analyser.area_list = selection
      $('#sectorlist').val(analyser.area_list)
      $('#sectorlist').selectpicker('render');
      $('#sectorlist').selectpicker('toggle');
      $('#sectorlist').selectpicker('toggle');
    } else {
      analyser.area_list = selection
    }
});

// Click on button after selected areas in area list
$('#launchAnalyzer').click(function(e){
  console.log('plop');
  e.preventDefault()
  // Reset Map style
  if (analyser.geo_mode == 'level3') {
    level3Layer.eachLayer(function(layer){
      layer.feature.properties.selected = false
    })
  } else if (analyser.geo_mode == 'level2') {
    level2Layer.eachLayer(function(layer){
      layer.feature.properties.selected = false
    })
  }
  reloadAnalyse()
})


// Load area list according to area mode selector
function setAreaList(areamode){
  // Change list of area
  if (areamode === 'zone') {
    console.log("This level is not currently working (No Dataset)");
  }

  // DISTRICTS
  else if (areamode === 'level3') {
    $('#sectorlist').selectpicker('destroy')
    let regions, districts
    if (config.geography.level2.exist) {
      regions = epibase.exec('SELECT DISTINCT level2_name, level2_pcode FROM epidata ORDER BY level2_name')
      districts = epibase.exec('SELECT DISTINCT level3_name, level3_pcode, level2_name, level2_pcode FROM epidata ORDER BY level3_name')
    } else {
      districts = epibase.exec('SELECT DISTINCT level3_name, level3_pcode FROM epidata ORDER BY level3_name')
    }
    // BUILD THE PICKER
    let query = '<select class="selectpicker form-control bg-white" title="Secteur" data-live-search="true" multiple id="sectorlist">'
    query += '<option selected value="*">All '+config.geography.level3.name+'s</option>'
    if (config.geography.level2.exist) {
      // GROUP DISTRICTS BY REGIONS WITH region_pcode
      $.each(regions, function(i,v){
        query += '<optgroup label="'+capitalize(v['level2_name'])+'">'
        $.each(districts, function(item, value){
          if (value['level2_pcode'] == v['level2_pcode']) {
            query += '<option value="'+value['level3_pcode']+'">'+capitalize(value['level3_name'])+'</option>'
          }
        })
        query += '</optgroup>'
      })
    } else {
      $.each(districts, function(item, value){
          query += '<option value="'+value['level3_pcode']+'">'+capitalize(value['level3_name'])+'</option>'
      })
    }

    query += '</select>'
    $('#sectorSelector').html(query)
    $('#sectorlist').selectpicker();
  }

  // REGIONS
  else if (areamode === 'level2') {
    $('#sectorlist').selectpicker('destroy')
    let countries, regions
    if (config.geography.level1.exist) {
      countries = epibase.exec('SELECT DISTINCT level1_name, level1_pcode FROM epidata ORDER BY level1_name')
      regions = epibase.exec('SELECT DISTINCT level2_name, level2_pcode, level1_name, level1_pcode  FROM epidata ORDER BY level2_name')
    } else {
      regions = epibase.exec('SELECT DISTINCT level2_name, level2_pcode FROM epidata ORDER BY level2_name')
    }
    // BUILD THE PICKER
    let query = '<select class="selectpicker form-control" title="Secteur" data-live-search="true" multiple id="sectorlist">'
    query += '<option selected value="*">All '+config.geography.level2.name+'s</option>'
    if (config.geography.level1.exist) {
      // GROUP REGIONS BY COUNTRIES WITH country_pcode
      $.each(countries, function(i,v){
        query += '<optgroup label="'+capitalize(v['level1_name'])+'">'
        $.each(regions, function(item, value){
          if (value['level1_pcode'] == v['level1_pcode']) {
            query += '<option value="'+value['level2_pcode']+'">'+capitalize(value['level2_name'])+'</option>'
          }
        })
        query += '</optgroup>'
      })
    } else {
      $.each(regions, function(item, value){
          query += '<option value="'+value['level2_pcode']+'">'+capitalize(value['level2_name'])+'</option>'
      })
    }
    query += '</select>'
    $('#sectorSelector').html(query)
    $('#sectorlist').selectpicker();
  }

  // COUNTRIES
  else if (areamode === 'level1') {
    $('#sectorlist').selectpicker('destroy')
      const countries = epibase.exec('SELECT DISTINCT level1_name, level1_pcode FROM epidata ORDER BY level1_name')
      // BUILD PICKER
      let query = '<select class="selectpicker form-control" title="Secteur" data-live-search="true" multiple id="sectorlist">'
      query += '<option selected value="*">All '+config.geography.level1.name+'s</option>'
      $.each(countries, function(i,v){
        query += '<option value="'+v['level1_pcode']+'">'+capitalize(v['level1_name'])+'</option>'
      })
      query += '</select>'
      $('#sectorSelector').html(query)
      $('#sectorlist').selectpicker();
  }
}
