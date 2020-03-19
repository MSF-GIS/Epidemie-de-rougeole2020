// Slider object, has method for each time range
const uniqueSlider = {
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
  initSlider(){
    // Initial Slider, with month range
    noUiSlider.create(this.target, {
      range: this.month_range,
      step: 1,
      start: this.default_month_start,
      connect: true,
      behaviour: "none",
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
                return Math.trunc(value)
            }, from: Number }
    })
    this.target.noUiSlider.on('end', function () {
      analyser.time_range = [slider.target.noUiSlider.get()[0], slider.target.noUiSlider.get()[1]]
    })
    analyser.time_range = this.default_month_start
  },
  day(){
    // Destroy existing slider instead of update it, because tooltips can't be updated
    slider.target.noUiSlider.destroy()
    noUiSlider.create(this.target, {
      range: this.day_range,
      step: 1,
      behaviour: "none",
      start: this.default_day_start[0],
      tooltips: [
        {
          to: (value) => {
            for (time of this.day_list) {
              if (time.id == Math.round(value)) {
                const date = dbDayToDate(time.day, time.week, time.year)
                analyser.end_time = {year: time.year, month: time.month, week: time.week, day: time.day}
                const res = date
                $('.daterange-start').html(res)
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
      analyser.time_range = slider.target.noUiSlider.get()
    })
    analyser.time_range = this.default_day_start[0]
  },
  week(){
    slider.target.noUiSlider.destroy()
    noUiSlider.create(this.target, {
      range: this.week_range,
      step: 1,
      behaviour: "none",
      start: this.default_week_start[0],
      tooltips: [
        {
          to: (value) => {
            for (time of this.week_list) {
              if (time.id == Math.round(value)) {
                analyser.start_time = {year: time.year, month: time.month, week: time.week}
                const week = time.week < 10 ? '0'+time.week : time.week
                const res = week+'-'+time.year
                $('.daterange-start').html(res)
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
      analyser.time_range = slider.target.noUiSlider.get()
    })
    analyser.time_range = this.default_week_start[0]
  },
  month(){
    slider.target.noUiSlider.destroy()
    noUiSlider.create(this.target, {
      range: this.month_range,
      step: 1,
      behaviour: "none",
      start: this.default_month_start[0],
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
        }
      ],
      format: { to: function (value) {
                return Math.round(value)
            }, from: Number }
    })
    this.target.noUiSlider.on('end', function () {
      analyser.time_range = slider.target.noUiSlider.get()
    })
    analyser.time_range = this.default_month_start[0]
  },
  year(){
    slider.target.noUiSlider.destroy()
    noUiSlider.create(this.target, {
      range: this.year_range,
      step: 1,
      behaviour: "none",
      start: this.default_year_start[0],
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
        }
      ],
      format: { to: function (value) {
                return Math.round(value)
            }, from: Number }
    })
    this.target.noUiSlider.on('end', function () {
      analyser.time_range = slider.target.noUiSlider.get()
    })
    analyser.time_range = this.default_month_start[0]
  }
}

function updateSliderByUniqueValue(){
  // Change current period on the Slider
  $('#prevStartDate').unbind().click(function(){
    const value = slider.target.noUiSlider.get() -1
    slider.target.noUiSlider.set(value)
    analyser.time_range = value
  })
  $('#nextStartDate').unbind().click(function(){
    const value = slider.target.noUiSlider.get() +1
    slider.target.noUiSlider.set(value)
    analyser.time_range = value
  })
}
