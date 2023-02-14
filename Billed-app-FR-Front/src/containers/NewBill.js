import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  createFile = data => {
    if (this.store) {
      return this.store
      .bills()
      .create({
        data,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => {
        // console.log(fileUrl)
        this.billId = key
        this.fileUrl = fileUrl
        // this.fileName = fileName
      })
      .catch(error => {
        console.error(error)
        throw error
      })
    }
  }

  hasValidExtension = (extension, validExtensions = ['jpg', 'jpeg', 'png']) => validExtensions.includes(extension.toLowerCase())
  handleChangeFile = e => {
    // const regexImage = new RegExp(/[^\s]+(.*?).(jpg|jpeg|png|JPG|JPEG|PNG)$/)
    e.preventDefault()
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    // const filePath = e.target.value.split(/\\/g)
    // const fileName = filePath[filePath.length-1]
    const formData = new FormData()
    
    const email = JSON.parse(localStorage.getItem("user")).email
    
    const errorExtension = this.document.querySelector("div[data-testid='error-extension']")
    errorExtension.classList.remove('show-error')
    errorExtension.classList.add('hide-error')
    const fileNameSplitted = file.name.split('.')
    const extension = fileNameSplitted[fileNameSplitted.length - 1].toLowerCase()
    // console.log('handleChange--- extension:'+extension)
    if (!this.hasValidExtension(extension)) {
      errorExtension.classList.add('show-error')
      errorExtension.classList.remove('hide-error')
      this.document.querySelector(`input[data-testid="file"]`).value=null
      return
    }
    formData.append('file', file)
    formData.append('email', email)
    this.fileName = file.name
    this.createFile(formData)
    // if(regexImage.test(fileName)){
    //   // console.log('Fichier OK')
    //   const formData = new FormData()
    //   const email = JSON.parse(localStorage.getItem("user")).email
    //   formData.append('file', file)
    //   formData.append('email', email)

    //   this.store
    //     .bills()
    //     .create({
    //       data: formData,
    //       headers: {
    //         noContentType: true
    //       }
    //     })
    //     .then(({fileUrl, key}) => {
    //       console.log(fileUrl)
    //       this.billId = key
    //       this.fileUrl = fileUrl
    //       this.fileName = fileName
    //     }).catch(error => console.error(error))

    //   }else{
    //     // console.log('Fichier KO !')
    //     let file = this.document.querySelector(`input[data-testid="file"]`)
    //     file.value = ''
    //     alert('Votre fichier doit être une image (jpg, jpeg ou png)')
    //     this.fileUrl = null
    //     this.fileName = null
    //     this.billId = null
        
    // }
    
  }

  handleSubmit = e => {
    e.preventDefault()
    // console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}