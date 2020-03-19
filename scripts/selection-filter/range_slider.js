// Slider object, has method for each time range
const rangeSlider = {
  target: document.getElementById('slider'),
  year_list:[],//USED FOR THE TOOLTIPS: WITH THE ID YOU GET THE YEAR/MONTH/TIME
  month_list:[],
  week_list:[],
  day_list:[],
  default_year_start: [],//USED TO SET THE START STEPS, SET TO MIN/MAX BY DEFAULT
  default_month_start:[],
  default_week_start:[],
  default_day_start:[],
  year_range: {},//USED TO DEFINE THE RANGE OF THE SLIDER (MIN TO MAX VALUE)
  month_range: {},
  week_range: {},
  day_range: {},
  day(){
    // Destroy existing slider instead of update it, because tooltips can't be updated
    if (slider.target.noUiSlider) {
      slider.target.noUiSlider.destroy()
    }
    noUiSlider.create(this.target, {
      range: this.day_range,
      step: 1,
      behaviour: "none",
      start: this.default_day_start,
      connect: true,
      tooltips: [
        {
          to: (value) => {
            for (time of this.day_list) {
              if (time.id == Math.round(value)) {
                const date = dbDayToDate(time.day, time.week, time.year)
                analyser.start_time = {year: time.year, month: time.month, week: time.week, day: time.day}
                const res = date
                $('.daterange-start').html(res)
                return res
              }
            }
          },
          from(value){
              return Math.round(value)
          }
        },{
          to: (value) => {
            for (time of this.day_list) {
              if (time.id == Math.round(value)) {
                const date = dbDayToDate(time.day, time.week, time.year)
                analyser.end_time = {year: time.year, month: time.month, week: time.week, day: time.day}
                const res = date
                $('.daterange-end').html(res)
                return res
              }
            }
          },
          from(value){
              return Math.round(value)
          }
        }
      ],
      format: { to: function (value) {
                return Math.round(value)
            }, from: Number }
    })
    this.target.noUiSlider.on('end', function () {
      analyser.time_range = [slider.target.noUiSlider.get()[0], slider.target.noUiSlider.get()[1]]
    })
    analyser.time_range = this.default_day_start
  },
  week(){
    if (slider.target.noUiSlider) {
      slider.target.noUiSlider.destroy()
    }
    noUiSlider.create(this.target, {
      range: this.week_range,
      step: 1,
      behaviour: "none",
      start: this.default_week_start,
      connect: true,
      tooltips: [
        {
          to: (value) => {
            for (time of this.week_list) {
              if (time.id == Math.round(value)) {
                analyser.start_time = {year: time.year, month: time.month, week: time.week}
                const week = time.week < 10 ? '0'+time.week : time.week
                const res = 'W'+week+'-'+time.year
                $('.daterange-start').html(res)
                return res
              }
            }
          },
          from(value){
              return Math.round(value)
          }
        },{
          to: (value) => {
            for (time of this.week_list) {
              if (time.id == Math.round(value)) {
                analyser.end_time = {year: time.year, month: time.month, week: time.week}
                const week = time.week < 10 ? '0'+time.week : time.week
                const res = 'W'+week+'-'+time.year
                $('.daterange-end').html(res)
                return res
              }
            }
          },
          from(value){
              return Math.round(value)
          }
        }
      ],
      format: { to: function (value) {
                return Math.round(value)
            }, from: Number }
    })
    this.target.noUiSlider.on('end', function () {
      analyser.time_range = [slider.target.noUiSlider.get()[0], slider.target.noUiSlider.get()[1]]
    })
    analyser.time_range = this.default_week_start
  },
  month(){
    if (slider.target.noUiSlider) {
      slider.target.noUiSlider.destroy()
    }
    noUiSlider.create(this.target, {
      range: this.month_range,
      step: 1,
      behaviour: "none",
      start: this.default_month_start,
      connect: true,
      tooltips: [
        {
          to: (value) => {
            for (time of this.month_list) {
              if (time.id == Math.round(value)) {
                analyser.start_time = {year: time.year, month: time.month}
                const month = time.month < 10 ? '0'+time.month : time.month
                const res = month+'-'+time.year
                $('.daterange-start').html(res)
                return res
              }
            }
          },
          from(value){
              return Math.round(value)
          }
        },{
          to: (value) => {
            for (time of this.month_list) {
              if (time.id == Math.round(value)) {
                analyser.end_time = {year: time.year, month: time.month}
                const month = time.month < 10 ? '0'+time.month : time.month
                const res = month+'-'+time.year
                $('.daterange-end').html(res)
                return res
              }
            }
          },
          from(value){
              return Math.round(value)
          }
        }
      ],
      format: { to: function (value) {
                return Math.round(value)
            }, from: Number }
    })
    this.target.noUiSlider.on('end', function () {
      analyser.time_range = [slider.target.noUiSlider.get()[0], slider.target.noUiSlider.get()[1]]
    })
    analyser.time_range = this.default_month_start
  },
  year(){
    if (slider.target.noUiSlider) {
      slider.target.noUiSlider.destroy()
    }
    noUiSlider.create(this.target, {
      range: this.year_range,
      step: 1,
      behaviour: "none",
      start: this.default_year_start,
      connect: true,
      tooltips: [
        {
          to: (value) => {
            for (time of this.year_list) {
              if (time.id == Math.round(value)) {
                analyser.start_time = {year: time.year}
                const res = time.year
                $('.daterange-start').html(res)
                return res
              }
            }
          },
          from(value){
              return Math.round(value)
          }
        },{
          to: (value) => {
            for (time of this.year_list) {
              if (time.id == Math.round(value)) {
                analyser.end_time = {year: time.year}
                const res = time.year
                $('.daterange-end').html(res)
                return res
              }
            }
          },
          from(value){
              return Math.round(value)
          }
        }
      ],
      format: { to: function (value) {
                return Math.round(value)
            }, from: Number }
    })
    this.target.noUiSlider.on('end', function () {
     analyser.time_range = [slider.target.noUiSlider.get()[0], slider.target.noUiSlider.get()[1]]
   })
    analyser.time_range = this.default_year_start
  }
}

function updateSliderByRangeValue(){
  // Change current period on the Slider
  $('#prevStartDate').unbind().click(function(){
    const min = slider.target.noUiSlider.get()[0] -1
    const max = slider.target.noUiSlider.get()[1]
    slider.target.noUiSlider.set([min, max])
    analyser.time_range = [min, max]
  })
  $('#nextStartDate').unbind().click(function(){
    const min = slider.target.noUiSlider.get()[0] +1
    const max = slider.target.noUiSlider.get()[1]
    slider.target.noUiSlider.set([min, max])
    analyser.time_range = [min, max]
  })
  $('#prevEndDate').unbind().click(function(){
    const min = slider.target.noUiSlider.get()[0]
    const max = slider.target.noUiSlider.get()[1] -1
    slider.target.noUiSlider.set([min, max])
    analyser.time_range = [min, max]
  })
  $('#nextEndDate').unbind().click(function(){
    const min = slider.target.noUiSlider.get()[0]
    const max = slider.target.noUiSlider.get()[1] +1
    slider.target.noUiSlider.set([min, max])
    analyser.time_range = [min, max]
  })
}
