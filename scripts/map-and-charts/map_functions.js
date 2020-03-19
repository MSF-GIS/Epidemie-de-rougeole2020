// Change on labels checkbox in legend tab
$('#labelsChekbox').change(function() {
  if ($(this).prop('checked')) {
		labels.addTo(mymap)
	} else {
    if (mymap.hasLayer(labels)) {
      mymap.removeLayer(labels)
    }
  }
})

// THESE FUNCTIONS DEFINE WHAT HAPPENS WHEN A USER CLICK ON A LAYER
function MapInteraction(feature, layer){
  // layer.on('click', function (e) {
  //   // If user click on selected area, area gets deselected
  //   if (e.target.feature.properties.selected) {
  //     e.target.feature.properties.selected = false;
  //     // Get the index of this pcode in the area_list and remove it
  //     const index = analyser.area_list.indexOf(e.target.feature.properties.pcode)
  //     analyser.area_list.splice(index, 1)
  //   }
  //   // Area gets selected
  //   else {
  //     e.target.feature.properties.selected = true;
  //   }
  //   // Loop on each layer to set analyser.area_list
  //   const grouplayer = eval(analyser.geo_mode+'Layer')
  //   analyser.area_list = []
  //   grouplayer.eachLayer(function(layer){
  //     if (layer.feature.properties.selected) {
  //       analyser.area_list.push(layer.feature.properties.pcode)
  //     }
  //   })
  //   if (analyser.area_list == 0) {
  //     analyser.area_list = ['*']
  //   }
  //   // Refresh the sector list
  //   $("#sectorlist").val(analyser.area_list);
  //   $('#sectorlist').selectpicker('render');
  //   analyser.selectMapData()
  // })
}

// This global variable is used to define group layer of proportionnal circles,
// It has to be define before the creation of the group layer.
let propCircles
// Functions for map: Set Circle Radius / Set PopUp Content / Display Swatchs and Circles
class Mapper {
  // Return the radius for a circle according to analyser.maxValue and analyser.maxRadius
	static getCircleRadius(value, maxValue, maxRadius){
    const radius = (maxRadius / 2 ) * Math.sqrt(value/maxValue)
    return radius
	}
  // Define pop up content for area in the area_list
  static setPopUpContent(value, name){
    let content = '<span class="popup-span">'+name.toUpperCase()+' : </span>'

    if (analyser.indicator == 'case') {
      content += parseInt(value)+' Cases'
    } else if (analyser.indicator == 'death') {
      content += parseInt(value)+' Deaths'
    } else if (analyser.indicator == 'attack') {
      content += 'Attack rate : '+value
    } else if (analyser.indicator == 'lethality') {
      content += 'Lethality rate : '+value
    } else if (analyser.indicator == 'vaccination') {
      content += 'Vaccination : '+value
    }
    return content
  }
  // PopUp for area without data or not it the analyser.area_list
  static setNoDataPopUp(name){
    let level
    if (analyser.geo_mode == "level3") {
      level = config.geography.level3.name
    } else if (analyser.geo_mode == "level2") {
      level = config.geography.level2.name
    } else if (analyser.geo_mode == "level1") {
      level = config.geography.level1.name
    }
    let content = '<span class="popup-span">'+name.toUpperCase()+'</span> : This '+level+' is not selected or does not contain data'
    return content
  }
  //Add a proportionnal circle to a layer
  static displayCircles(layer, pcode, result, maxValue){
    if (layer.feature.properties.pcode == pcode && result > 0) {
      layer.feature.properties.selected = true
      layer.feature.properties.result = result
      // Turf is used to calculate the centroid of a layer
      var centroid = turf.centerOfMass(layer.feature);
      var lon = centroid.geometry.coordinates[0];
      var lat = centroid.geometry.coordinates[1];
      let circle
      const radius = Mapper.getCircleRadius(result, maxValue, analyser.circleMaxRadius)
      circle = L.circleMarker([lat, lon], {
        "weight": 1,
        "color": analyser.circleContour,
        "opacity": 0.7,
        "fillColor": analyser.circleFill,
        "fillOpacity": 0.7,
        "radius": radius
      })
      propCircles.addLayer(circle)
      circle.bindPopup(Mapper.setPopUpContent(result, layer.feature.properties.name));
    } else if (layer.feature.properties.pcode == pcode && result == 0) {
      layer.feature.properties.selected = true
      layer.feature.properties.result = result
      layer.setStyle({
        "weight": 1,
        "color": "#000",
        "opacity": 0.7,
        "fillColor": "#FFF",
        "fillOpacity": 0
      });
      layer.bindPopup(Mapper.setPopUpContent(result, layer.feature.properties.name));
    }
  }
  // Add color swatch to a layer
  static displayColorSwatchs(layer, pcode, value, tresholds, colors){
    if (layer.feature.properties.pcode == pcode) {
      layer.feature.properties.selected = true
      layer.bindPopup(Mapper.setPopUpContent(value, layer.feature.properties.name))
      if (value == 0) {
        layer.setStyle({
          "weight": 1,
          "color": "#000",
          "opacity": 0.7,
          "fillColor": colors[0],
          "fillOpacity": 0.9
        });
      } else {
        let selectedColor
        for (let i = 0; i < tresholds.length; i++) {
          // Between 0 and first treshold
          if (i == 0) {
            if (value <= tresholds[i]) {
              selectedColor = colors[i+1]
            }
          }
          // Between first treshold and last treshold
          if (i <= tresholds.length-2) {
            if (value > tresholds[i] && value <= tresholds[i+1]) {
              selectedColor = colors[i+2]
            }
          }
          // Last treshold
          if (i == tresholds.length-1) {
            if (value > tresholds[i]) {
              selectedColor = colors[i+2]
            }
          }
        }
        layer.setStyle({
            "weight": 1,
            "color": "#000",
            "opacity": 0.7,
            "fillColor": selectedColor,
            "fillOpacity": 0.7
          });
      }
    }
  }
  //Applied to layer without data or not in the analyser.area_list
  static setNoDataStyle(layer){
    layer.unbindPopup();
    layer.setStyle({
      "weight": 1,
      "color": "#000",
      "opacity": 0.7,
      "fillColor": config.mapping.no_data,
      "fillOpacity": 0.8
    });
    layer.bindPopup(Mapper.setNoDataPopUp(layer.feature.properties.name));
  }
  //Remove polygon style (called before add proportionnal circles)
  static resetStyle(layer){
    layer.feature.properties.selected = false
    layer.unbindPopup();
    layer.setStyle({
      "weight": 1,
      "color": "#000",
      "opacity": 0.7,
      "fillColor": "#fff",
      "fillOpacity": 0.3
    });
  }
  static async displayCaseOrDeath(dataset, maxValue){
    if (mymap.hasLayer(propCircles)) {
      mymap.removeLayer(propCircles)
    }
    propCircles = L.layerGroup()
    const grouplayer = await eval(analyser.geo_mode+'Layer')
		Mapper.setLabels(grouplayer)
    grouplayer.eachLayer(function(layer){
      // Reset layer style
      Mapper.resetStyle(layer)
      $.each(dataset, function(i, v){
        Mapper.displayCircles(layer, v['pcode'], v['result'], maxValue)
      })
      propCircles.addTo(mymap)
    })
    grouplayer.eachLayer(function(layer){
      if (!layer.feature.properties.selected) {
        Mapper.setNoDataStyle(layer)
      } else {
        layer.bindPopup(Mapper.setPopUpContent(layer.feature.properties.result, layer.feature.properties.name));
      }
    })
  }
  static async displayMortalityOrAttack(dataset, tresholds, colors){
    if (mymap.hasLayer(propCircles)) {
      mymap.removeLayer(propCircles)
    }
    const grouplayer = await eval(analyser.geo_mode+'Layer')
		Mapper.setLabels(grouplayer)
    grouplayer.eachLayer(function(layer){
      Mapper.resetStyle(layer)
      if (analyser.indicator == 'attack') {
        $.each(dataset, function(i, v){
          let rate = Math.round((v['result'] / v['occurence'])*100000)/100000
            if (v['attack'] == 0 && v['occurence'] == 0) {
              rate = 0
            }
          Mapper.displayColorSwatchs(layer, v['pcode'], rate, tresholds, colors)
        })
      } else if (analyser.indicator == 'lethality') {
        $.each(dataset, function(i, v){
            Mapper.displayColorSwatchs(layer, v['pcode'], v['result'], tresholds, colors)
        })
      }

    })
    grouplayer.eachLayer(function(layer){
      if (!layer.feature.properties.selected) {
        Mapper.setNoDataStyle(layer)
      }
    })
  }
	static setLabels(group){
		if (mymap.hasLayer(labels)) {
      mymap.removeLayer(labels)
    }
		labels = L.layerGroup.collision({margin:5});
		group.eachLayer(l => {
			const centroid = turf.centerOfMass(l.feature);
				labels.addLayer(L.marker([centroid.geometry.coordinates[1], centroid.geometry.coordinates[0]], {
		      opacity: 1.0,
		      icon: L.divIcon({
							html:`<span class='village-label'>${capitalize(l.feature.properties.name)}</span>`
						}),
		        interactive: true
		    })
			)
		})
    if ($('#labelsChekbox').is(':checked')) {
      labels.addTo(mymap)
    }
	}
}
