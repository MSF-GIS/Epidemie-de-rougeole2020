/* Configuration file - epiMap
 * Change the webmap' settings here, accordingly with the associated comments (lines starting with "//").
 * Please keep in mind that parameters are case-sensitives.
 */
const config = {
  // Name of your epimap version
  name: '',

  //DROPDOWNS LISTS CONFIGURATION
  time: {
    // Set to "true" for each time unit you want analysis, else set to "false"
    year: true,
    month: false,
    week: true,
    day: false
  },
  geography: {
    // Set to "true" for each geographic level you want analysis, else set to "false"
    level1: {
      exist: true,
      name: 'Provincial health division'//Name of your level, put it in the singular
    },
    level2: {
      exist: true,
      name: 'Health zone'//Name of your level, put it in the singular
    },
    level3: {
      exist: true,
      name: 'Health area'//Name of your level, put it in the singular
    }
  },
  disease: [
    // Copy and change this block for every disease you want to add to analysis
    {//From here...
      // The name of your disease
      name: 'rougeole',
      // The code of your disease, it has to be the same than in CSV header
      code: 'rg',
      // Configure each indicator for each disease
      indicators: {
        // Cases: just set to "true" or "false"
        case: true,
        // Deaths: just set to "true" or "false"
        death: true,
        // Attack rate: set exist to "true" or "false", if setted to true, personalize the multiplier, tresholds, and colors
        // if setted to false, you can let default values
        attack: {
          exist: true,
          // Multiplier for Attack rate
          multiplier: 100,
          // Tresholds for Attack rate
          tresholds: [0.01, 0.05, 0.1, 0.5, 0.8],
          // Colors for polygons, include 0 (first color), from 0 to first treshold, betweend every tresholds, and superior to last treshold (last color)
          // If you have 5 tresholds, you need 7 colors
          colors: ["#FFF", "#FFE9E0", "#FFC7B4", "#FFA791", "#FF8875", "#E75B5B","#B8474F"]
        },
        // lethality: This indicator can be calculated by the app if cases and deaths are filled in the dataset
        // set exist to "true" or "false", if setted to true, personalize the multiplier, tresholds, and colors
        // if setted to false, you can let default values
        lethality: {
          exist: true,
          // Multiplier for lethality
          multiplier: 100,
          // Tresholds for lethality
          tresholds: [0.0001, 0.0002, 0.0005, 0.0009],
          // Colors for polygons, include 0 (first color), from 0 to first treshold, betweend every tresholds, and superior to last treshold (last color)
          // If you have 5 tresholds, you need 7 colors
          colors: ["#FFF", "#FFE9E0", "#FFA791","#E75B5B","#E75B5B","#B8474F"]
        }
      }
    },//...to here
  ],

  // MAP ITEMS CONFIGURATION
  // You can get hexa color codes here: https://htmlcolorcodes.com/
  mapping: {
    // Color of polygons without data, only hexa color code is accepted
    no_data: '#9fa6a6',
    // Circles border color, only hexa color code is accepted
    circles_contour: "#000",
    // Circles fill color, only hexa color code is accepted
    circles_fill: "#e91625",
    // Circles max radius, integers values only
    circles_radius: 75,
  },

  // CONFIGURE APPLICATION INITIALISATION (to fill with values you have in your dataset)
  initialisation: {
    time: 'week',//Accepted values: 'year', 'month', 'week', 'day'
    geography: 'level3',//Accepted values: 'level1', 'level2', 'level3'
    disease: 'rg'//Accepted values: any of your diseases code
  },
  // INFOS BOX
  informations:{
    open_by_default: false,//Accepted values: true / false
    content: `<p>This information window is used to present the end-user with contextual or explicative content, or to provide additionnal information such as the source of spatial and epidemiological data. For instance:</p>
`
  }
}
