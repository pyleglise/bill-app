/**
 * @jest-environment jsdom
 */
import {screen, fireEvent, waitFor} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import router from "../app/Router.js"
import mockStore from "../__mocks__/store"
// import userEvent from "@testing-library/user-event"

let newBill
let inputFileGet
let inputFile

describe("Given I am connected as an employee", () => {
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
  })
  describe("When I am on NewBill Page", () => {
    beforeAll(()=>{
      
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill);
    })
    test("Then mail icon should be higlighted", async () => {
      
      //to-do write assertion
      const iconMail = await waitFor(() => screen.getByTestId("icon-mail"))
      // const iconMail = screen.getByTestId("icon-mail")
      expect(iconMail.classList.contains('active-icon')).toBeTruthy()
      })

    test("Then form new bill is displayed", async () => {
      const formNewBill = await waitFor(() => screen.getByTestId('form-new-bill'))
      expect(formNewBill).toBeTruthy()
    })
  })
 
  

  describe("When I upload a new file", () => {
    beforeAll(() => {
      document.body.innerHTML=""
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })
    })
  
    describe("When the file is added we test the extension", () => {
      it("should return true when extension is valid", () => {
        expect(newBill.hasValidExtension('jpg')).toEqual(true)
        expect(newBill.hasValidExtension('jpeg')).toEqual(true)
        expect(newBill.hasValidExtension('png')).toEqual(true)
      })
      it("should return false when extension is invalid", () => {
        expect(newBill.hasValidExtension('fake')).toEqual(false)
        expect(newBill.hasValidExtension('doc')).toEqual(false)
      })
    })
  
    describe("When the file is added to the form",  () => {
      beforeAll(async () => {
        inputFile = await waitFor(() => screen.getByTestId('file'))
        inputFileGet = jest.fn()
        Object.defineProperty(inputFile, 'files', {
          get: inputFileGet
        })
      })
      afterEach(() => {    
        jest.clearAllMocks()
      })
      test("then test with a valid file then a new file is created", async () => {
        inputFileGet.mockReturnValue([{
          name: 'good-extension-file.png',
          size: 8899,
          blob: 'defined-blob'
        }])
        const createFile = jest.spyOn(newBill, 'createFile')

        fireEvent.change(inputFile)
        const errorExtension = await waitFor(() => screen.getByTestId('error-extension'))
        expect(errorExtension.classList.contains('hide-error')).toBe(true)
        expect(createFile).toHaveBeenCalled()
      })

      test("then test with an invalid file then a new file is created", async () => {
        inputFileGet.mockReturnValue([{
          name: 'bad-extension-file.doc',
          size: 9988,
          blob: 'another-defined-blob'
        }])
        const createFile = jest.spyOn(newBill, 'createFile')

        fireEvent.change(inputFile)
        const errorExtension = await waitFor(() => screen.getByTestId('error-extension'))
        expect(errorExtension.classList.contains('show-error')).toBe(true)
        expect(createFile).toHaveBeenCalledTimes(0)
      })
    })

    describe("When the form is submited", () => {
      test("Then bill is inserted in datas and user redirected to the bills list", async () => {
        const formNewBill = await waitFor(() => screen.getByTestId('form-new-bill'))

        const updateBill = jest.spyOn(newBill, 'updateBill')
        const onNavigate = jest.spyOn(newBill, 'onNavigate')

        fireEvent.submit(formNewBill)

        expect(updateBill).toHaveBeenCalled()
        expect(onNavigate).toHaveBeenCalled()
      })
    })
  })
  describe("Test API createFile method", () => {
    beforeAll(() => {
      jest.mock("../app/store", () => mockStore)
      jest.spyOn(mockStore, "bills")
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = mockStore
      newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })
    })
    test('POST data then get fileUrl and key', async () => {
      await newBill.createFile({})
      expect(newBill.fileUrl).toEqual('https://localhost:3456/images/test.jpg')
      expect(newBill.billId).toEqual('1234')
    })
    test("POST data to API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          create : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      await expect(newBill.createFile({})).rejects.toEqual(new Error("Erreur 404"))
    })
    test("POST data to API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          create : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
      await expect(newBill.createFile({})).rejects.toEqual(new Error("Erreur 500"))
    })
  })
})
