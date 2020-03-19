
function configurePDF(){
  $('#modalpdf').modal('show')
  $('#launchPDF').unbind().click(function(e){//Unbind stop several launchs when cliking
    e.preventDefault();
    const title = $('#pdf-title').val()
    const sources = $('#pdf-sources').val()

    createPDF(title, sources)
    $('#modalpdf').modal('hide')
  })
}



function createPDF(title, sources){
  let SourceText = false
  if (sources !== '') {
    SourceText = true
  }
  const pdfInfos = getSurveyInfos()
  $('#loading-text').html('Generating PDF, please wait.')
  $('.overlay-loader').show()
  const doc = new jsPDF({
    orientation: 'landscape',
    format: 'a4'
  })
  let hasLabels = false
  if (mymap.hasLayer(labels)) {
    mymap.removeLayer(labels)
    hasLabels = true
  }
  // Header
  doc.addImage(pdfimages.header, 'JPEG', 0, 0, 297, 16);
  doc.setFontType('bold')
  doc.setFontSize(15)
  doc.setTextColor(255, 255, 255)
  doc.text(25, 5, 'EPIMAP')
  doc.setFontSize(14)
  doc.text(48,  5, title)
  doc.setTextColor(0, 0, 0)
  // Map
  leafletImage(mymap, function(err, canvas) {
    const mapimg = document.createElement('img');
    var dimensions = mymap.getSize();
    mapimg.width = dimensions.x;
    mapimg.height = dimensions.y;
    mapimg.src = canvas.toDataURL();
    const ratio = dimensions.x / 230
    const mapHeight = dimensions.y / ratio
    doc.addImage(mapimg, 'JPEG', 0, 20, 230, mapHeight);
    doc.addImage(pdfimages.north_arrow, 'PNG', 5, 37, 2.3, 13.6);

    //Legend
    doc.setFontSize(12);
    doc.text('Survey informations:', 263, 35, null, null, 'center');
    doc.setFontSize(10);
    doc.text(235, 45, 'Disease: '+pdfInfos.disease);
    doc.text(235, 50, 'Indicator: '+pdfInfos.indicator);
    doc.text(235, 55, 'Geographic level: '+pdfInfos.geography);
    doc.text(235, 60, 'Time unit: '+pdfInfos.time);
    analyser.sliderMode == 'Range' ? doc.text(235, 65, 'Range: '+pdfInfos.range) : doc.text(235, 65, 'Date: '+pdfInfos.date)

    doc.setFontSize(12);
    doc.text('Legend', 263, 75, null, null, 'center');
    // Show legend to render it as image
    if (!$('.legend-panel').is(':visible')) {
      $('.legend-panel').show()
    }
    if (analyser.indicator == 'case' || analyser.indicator == 'death') {
      html2canvas($('.legend-circle-container')[0]).then(function(legend) {
          const imgData = document.createElement('img');
          imgData.height = $('.legend-circle-container').height();
          imgData.width = $('.legend-circle-container').width();
          const ratio = imgData.width / 67
          imgData.src = legend.toDataURL();
          doc.addImage(imgData, 'JPEG', 235, 80, imgData.width/ratio, imgData.height/ratio);

          imgData.height = imgData.height / ratio
          imgData.width = imgData.width/ratio

          const endLegendHeight = 80+imgData.height+5
          doc.text('Sources', 263, endLegendHeight, null, null, 'center');
          doc.setFontSize(10)
          if (!SourceText) {
            doc.text(235, endLegendHeight+5, 'Cases and rates: MSF');
            doc.text(235, endLegendHeight+10, 'Administrative boundaries: OCHA');
            doc.text(235, endLegendHeight+15, 'Basemap: OSM contributors');
          } else {
            doc.text(235, endLegendHeight+5, sources);
          }


          doc.setFontSize(12);
          doc.text('Edition date: '+new Date(Date.now()).toLocaleDateString(), 263, endLegendHeight+25, null, null, 'center');

          // Footer
          doc.addImage(pdfimages.bottom_text, 'JPEG', 0, 202, 297, 8);
          doc.addImage(pdfimages.logo_msf, 'JPEG', 242, 185, 45, 20);//45*20
          if ($('.legend-panel').is(':visible')) {
            $('.legend-panel').hide ()
          }
          $('.overlay-loader').hide()
          if (title != '') {
            doc.save(title+'.pdf')
          } else {
            const namePDF = 'Epimap-PDF-Export_'+new Date(Date.now()).toLocaleDateString("fr-FR")+'.pdf'
            doc.save(namePDF)
          }

      });
    } else if (analyser.indicator == 'attack' || analyser.indicator == 'letality') {
      // Convert legend to image
      html2canvas($('.legend-tresholds')[0]).then(function(legend) {
          const imgData = document.createElement('img');
          imgData.height = $('.legend-tresholds').height()
          imgData.width = $('.legend-tresholds').width()
          const ratio = imgData.width / 67
          imgData.src = legend.toDataURL();
          doc.addImage(imgData, 'JPEG', 235, 80, imgData.width/ratio, imgData.height/ratio);

          imgData.height = imgData.height / ratio
          imgData.width = imgData.width/ratio

          const endLegendHeight = 80+imgData.height+5
          doc.text('Sources', 263, endLegendHeight, null, null, 'center');
          doc.setFontSize(10)
          if (!SourceText) {
            doc.text(235, endLegendHeight+5, 'Cases and rates: MSF');
            doc.text(235, endLegendHeight+10, 'Administrative boundaries: OCHA');
            doc.text(235, endLegendHeight+15, 'Basemap: OSM contributors');
          } else {
            doc.text(235, endLegendHeight+5, sources);
          }


          doc.setFontSize(12);
          doc.text('Edition date '+new Date(Date.now()).toLocaleDateString(), 263, endLegendHeight+25, null, null, 'center');

          // Footer
          doc.addImage(pdfimages.bottom_text, 'JPEG', 0, 202, 297, 8);
          doc.addImage(pdfimages.logo_msf, 'JPEG', 242, 185, 45, 20);//45*20
          if ($('.legend-panel').is(':visible')) {
            $('.legend-panel').hide ()
          }
          $('.overlay-loader').hide()
          if (title != '') {
            doc.save(title+'.pdf')
          } else {
            const namePDF = 'Epimap-PDF-Export_'+new Date(Date.now()).toLocaleDateString("fr-FR")+'.pdf'
            doc.save(namePDF)
          }
      });
    }


  });
}

const doc = new jsPDF({
  orientation: 'landscape',
  format: 'a4'
})
