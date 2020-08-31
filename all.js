const app = new Vue({
  el: '#app',
  data: {
    loading: true,
    data: [],
    option: {
      ramMin: 16,
      priceMin: 25000,
      priceMax: 40000,
      weightMax: 1.5,
    },
  },
  computed: {
    isLaptopData() {
      return this.data.filter((item) => {
        const moreThanTem = Object.keys(item).length >= 10
        const hasExpectWord1 = JSON.stringify(item).includes('電源')
        const hasExpectWord2 = JSON.stringify(item).includes('相機')
        const result = moreThanTem && !hasExpectWord1 && !hasExpectWord2
        return result
      })
    },
    filterLaptopData() {
      const vm = this
      return this.isLaptopData
        .filter(function RAM(item, index) {
          try {
            const ramText = item[3]
            const ramBasic = vm.getRamBasic(ramText)
            const ramMax = vm.getRamMax(ramText) || ramBasic
            // console.log(index, ramBasic, ramMax, ramText)

            return ramMax >= vm.option.ramMin
          } catch (e) {
            console.log(index, item[3], e)
            return true
          }
        })
        .filter(function PRICE(item, index) {
          try {
            const priceText = item[9]
            const price = Number(priceText.match(/NT([0-9]+)/)[1])
            // console.log(
            //   index,
            //   item[9],
            //   price,
            //   vm.option.priceMin,
            //   vm.option.priceMax,
            //   price >= vm.option.priceMin,
            //   price <= vm.option.priceMax
            // )

            return price >= vm.option.priceMin && price <= vm.option.priceMax
          } catch (e) {
            console.log(index, item[9], e)
            return true
          }
        })
        .filter(function WEIGHT(item, index) {
          try {
            const weightText = item[7]
            const weight = vm.getWeight(weightText)
            // console.log(index, weight, weightText)
            return weight <= vm.option.weightMax
          } catch (e) {
            console.log(index, item[9], e)
            return true
          }
        })
    },
  },
  methods: {
    getRamBasic(ramText) {
      const regularResultGB = ramText.match(/([0-9]*)GB/)
      const regularResultG = ramText.match(/([0-9]*)G/)

      if (regularResultGB == null && regularResultG == null) {
        return null
      } else if (regularResultGB) {
        return Number(regularResultGB[1])
      } else if (regularResultG) {
        return Number(regularResultG[1])
      }
    },
    getRamMax(ramText) {
      const regularResult_G = ramText.match(/Max ([0-9]*)G/)
      const regularResultDotG = ramText.match(/Max\.([0-9]*)G/)
      const regularResultColonG = ramText.match(/Max\: ([0-9]*)G/)

      if (
        regularResult_G == null &&
        regularResultDotG == null &&
        regularResultColonG == null
      ) {
        return null
      } else if (regularResult_G) {
        return Number(regularResult_G[1])
      } else if (regularResultDotG) {
        return Number(regularResultDotG[1])
      } else if (regularResultColonG) {
        return Number(regularResultColonG[1])
      }
    },
    getWeight(weightText) {
      const regularResultG = weightText.match(/([0-9.]*)g/)
      const regularResultKG = weightText.match(/([0-9.]*)Kg/i)
      const regularResultNoKG = weightText.match(/([0-9.]*) /i)

      if (
        regularResultG == null &&
        regularResultKG == null &&
        regularResultNoKG == null
      ) {
        return null
      } else if (regularResultKG) {
        return Number(regularResultKG[1])
      } else if (regularResultG) {
        return Number(regularResultG[1]) / 1000
      } else if (regularResultNoKG) {
        return Number(regularResultNoKG[1])
      }
    },
    getDefaultFilterItems() {
      this.$set(this, 'option', {
        ramMin: 16,
        priceMin: 25000,
        priceMax: 40000,
        weightMax: 1.5,
      })
    },
    getAllItems() {
      this.$set(this, 'option', {
        ramMin: 0,
        priceMin: 0,
        priceMax: 999999,
        weightMax: 10,
      })
    },
  },
  mounted() {
    const vm = this
    const cors = 'https://cors-anywhere.herokuapp.com/'
//     const cors = 'https://cors-unlimited.herokuapp.com/'
    const API = 'http://www.coolpc.com.tw/eachview.php?IGrp=2'

    console.log('mount')

    axios
      .get(cors + API)
      .then((res) => {
        vm.loading = false
        return res.data
      })
      .then((html) => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html') // DOM
        // console.log(doc)
        const main = doc.querySelector('.main')
        const itemElements = main.querySelectorAll('span')
        // console.log(itemElements)

        itemElements.forEach((element, index) => {
          const divElements = element.querySelectorAll('div')
          const divData = {}
          divElements.forEach((elemtns, i) => {
            divData[i] = divElements[i].textContent
          })

          vm.data.push(divData)
        })
      })
      .catch((err) => console.log(err))
  },
})
