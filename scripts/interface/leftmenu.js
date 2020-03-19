// CHANGE ICON STYLE ON CLICK
$('.click-change').click(function(e){
  // Click on icon and not on the div
  if (e.target !== this){
    if (!$(e.target).hasClass("second-icon")) {
      $( e.target ).prev().toggleClass( "inactive-icon" );
      $( e.target ).toggleClass( "inactive-icon" );
    } else { //IS NOT ACTIVE
      $( e.target ).next().toggleClass( "inactive-icon" );
      $( e.target ).toggleClass( "inactive-icon" );
    }
  }
  // Click on the div, not on icon
  else {
    $( e.target ).children().each(function(){
      $(this).toggleClass('inactive-icon')
    })
  }
})

//LEFT MENU BEHAVIOR
// SHOW/HIDE MAP OR CHARTS DIV
$('#map-left-menu').click(function(){
  if ($('#map').is(':visible')) {
    $('#map').hide()
    $('.legend-button').hide()
    $('#charts').removeClass('col-6')
    $('#charts').addClass('col-12')
  } else {
    $('#map').show()
    $('.legend-button').show()
    $('#charts').removeClass('col-12')
    $('#charts').addClass('col-6')
  }
  mymap.invalidateSize()
})

$('#charts-left-menu').click(function(){
  if ($('#charts').is(':visible')) {
    $('#charts').hide()
    $('#map').removeClass('col-6')
    $('#map').addClass('col-12')
  } else {
    $('#charts').show()
    $('#map').removeClass('col-12')
    $('#map').addClass('col-6')
  }
  mymap.invalidateSize()
})

$('#pdf-left-menu').click(function(e){
  e.preventDefault()
  if ($('#map').is(':visible')){
    configurePDF()
  } else {
    addNotify('Veuillez afficher la carte avant de générer un PDF', 'danger')
  }
})

$('#user-left-menu').click(function(e){
  e.preventDefault()
  $('#modalinfo').modal('show')
})


$('#collapseConfig').on('shown.bs.collapse', function () {
  // change the icon color
  $('.collapse-config').toggleClass( "disabled" )
})
$('#collapseConfig').on('hidden.bs.collapse', function () {
  // change the icon color
  $('.collapse-config').toggleClass( "disabled" )
})
