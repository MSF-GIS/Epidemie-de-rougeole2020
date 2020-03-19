// Function to check if a value is contained in a Array
const contains = function(needle) {
    // Per spec, the way to identify NaN is that it is not equal to itself
    var findNaN = needle !== needle;
    var indexOf;
    if(!findNaN && typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(needle) {
            var i = -1, index = -1;
            for(i = 0; i < this.length; i++) {
                var item = this[i];
                if((findNaN && item !== item) || item === needle) {
                    index = i;
                    break;
                }
            }
            return index;
        };
    }
    return indexOf.call(this, needle) > -1;
};

// Group an array of object by an object key
const groupBy = (items, key) => items.reduce(
  (result, item) => ({
    ...result,
    [item[key]]: [
      ...(result[item[key]] || []),
      item,
    ],
  }),
  {},
);

function roundNumber(inNumber) {
  return (Math.round(inNumber/10) * 10);
}

// Variable to convert month number to month name
const numb2Month = {
	'1': 'Jan',
	'2': 'Feb',
	'3': 'Mar',
	'4': 'Apr',
	'5': 'May',
	'6': 'Jun',
	'7': 'Jul',
	'8': 'Aug',
	'9': 'Sep',
	'10': 'Oct',
	'11': 'Nov',
	'12': 'Dec',
}

//Function to convert hex format to a rgb color
function hex2rgb(hex,opacity){
    hex = hex.replace('#','');
    r = parseInt(hex.substring(0,2), 16);
    g = parseInt(hex.substring(2,4), 16);
    b = parseInt(hex.substring(4,6), 16);
    result = 'rgba('+r+','+g+','+b+',0.7)';
    return result;
}

// Check if value == TRUE
const isTrue = (value) => value == 'TRUE'

function stringToNumber(value){
  if (value == ""){
      return null
  } else {
    return Number(value)
  }

}

function getSurveyInfos(){
  const infos = {}
  infos.time = capitalize(analyser.time_mode)
  for (let d of config.disease) {
    if (d.code == analyser.disease) {
      infos.disease = capitalize(d.name)
      if (analyser.indicator == 'attack' || analyser.indicator == 'lethality') {
        infos.denominator = d.indicators[analyser.indicator].denominator
      }
    }
  }
  if (analyser.indicator == 'case') {
    infos.indicator = 'Cases'
  } else if (analyser.indicator == 'death') {
    infos.indicator = 'Deaths'
  } else if (analyser.indicator == 'attack') {
    infos.indicator = 'Attack Rate/'+infos.denominator
  } else if (analyser.indicator == 'lethality') {
    infos.indicator = 'Lethality Rate/'+infos.denominator
  }
  infos.geography = capitalize(config.geography[analyser.geo_mode].name)
  if (analyser.sliderMode == 'Range') {
    if (analyser.time_mode == 'year') {
      infos.range = `Start ${analyser.start_time.year} - End ${analyser.end_time.year}`
    } else if (analyser.time_mode == 'month') {
      infos.range = `${numb2Month[analyser.start_time.month]} ${analyser.start_time.year} - ${numb2Month[analyser.end_time.month]} ${analyser.end_time.year}`
    } else if (analyser.time_mode == 'week') {
      infos.range = `W ${analyser.start_time.week}/${analyser.start_time.year} - W ${analyser.end_time.week}/${analyser.end_time.year}`
    } else if (analyser.time_mode == 'day') {
      infos.range = `${dbDayToDate(analyser.start_time.day, analyser.start_time.week, analyser.start_time.year)} - ${dbDayToDate(analyser.end_time.day, analyser.end_time.week, analyser.end_time.year)}`
    }
  } else {
    if (analyser.time_mode == 'year') {
      infos.date = analyser.start_time.year
    } else if (analyser.time_mode == 'month') {
      infos.date = `${numb2Month[analyser.start_time.month]} ${analyser.start_time.year}`
    } else if (analyser.time_mode == 'week') {
      infos.date = `W ${analyser.start_time.week}/${analyser.start_time.year}`
    } else if (analyser.time_mode == 'day') {
      infos.date = `${dbDayToDate(analyser.start_time.day, analyser.start_time.week, analyser.start_time.year)}`
    }
  }

  return infos
}

function addNotify(message, type, delay=2000){
  if (type == "success") {
    $.notify({
        message: message
      },{
        type: 'success',
        delay: delay,
        z_index: 2000,
    })
  } else if (type == "danger") {
    $.notify({
        message: message
      },{
        type: 'danger',
        delay: delay,
        z_index: 2000,
    })
  }
}

// Capitalise first letter of a string
const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function dbDayToDate(day, week, year){
  const realDay = week < 2 ? day : 7*(week-1)+day
  const date = new Date(year, 0); // initialize a date in `year-01-01`
  return new Date(date.setDate(realDay)).toLocaleDateString(); // add the number of days
}
