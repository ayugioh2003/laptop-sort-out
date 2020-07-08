const app = new Vue({
  el: '#app',
  data: {
    select: 'select',
    loading: true,
    data: {},
  },
  mounted() {
    const vm = this
    // const cors = 'https://cors-anywhere.herokuapp.com/'
    const cors = 'https://cors-unlimited.herokuapp.com/'
    const API = 'www.coolpc.com.tw/evaluate.php'

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
        const select = doc.querySelector('#tbdy tr select[name=n2]')
        const optgroups = select.querySelectorAll('optgroup')

        optgroups.forEach((element) => {
          const label = element.label
          const options = element.querySelectorAll('option')
          const optionsArr = [...options].map((option) => option.textContent)

          if (optionsArr.length != 0) {
            vm.$set(vm.data, label, {
              id: label,
              products: optionsArr
            })
          }
        })
      })
      .catch((err) => console.log(err))
  },
})
