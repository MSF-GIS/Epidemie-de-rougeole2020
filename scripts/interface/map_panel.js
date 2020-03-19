// Change button style on hover
$('.legend-button').hover(
  function(e) {
       $(e.target).toggleClass('inactive-icon')
       $( e.target ).next().toggleClass( "inactive-icon" );
  }, function(e) {
    $(e.target).toggleClass('inactive-icon')
    $( e.target ).prev().toggleClass( "inactive-icon" );
  }
);

$('.legend-button').click(function(e){
  if ($('.opened').is(':visible')) {
    // Change icon in legend button
    $('.opened').hide()
    $('.closed').show()
    // Change hover behavior of the legend button
    $('.closed').children().each(function(){
      $(this).toggleClass('inactive-icon')
    });
  } else {
    // Change icon in legend button
    $('.opened').show()
    $('.closed').hide()
    // Change hover behavior of the legend button
    $('.closed').children().each(function(){
      $(this).toggleClass('inactive-icon')
    })
  }
});

// Menu map-filter
function toggleClassMenu () {
  myMenu.classList.add('c-map-filter_animatable')
  oppMenu.classList.add('c-map-filter-toggle_animatable')
  if (!myMenu.classList.contains('c-map-filter_visible')) {
    myMenu.classList.add('c-map-filter_visible')
    oppMenu.classList.add('c-map-filter-toggle_close')
  } else {
    myMenu.classList.remove('c-map-filter_visible')
    oppMenu.classList.remove('c-map-filter-toggle_close')
  }
}

function OnTransitionEnd () {
  myMenu.classList.remove('c-map-filter_animatable')
  oppMenu.classList.remove('c-map-filter_animatable')
}

var myMenu = document.querySelector('.c-map-filter')
var oppMenu = document.querySelector('.c-map-filter-toggle')
myMenu.addEventListener('transitionend', OnTransitionEnd, false)
oppMenu.addEventListener('click', toggleClassMenu, false)


// Initialise Tooltip for legend modifyer
$("[rel='tooltip']").tooltip();
