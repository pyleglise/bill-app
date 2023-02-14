/**
 * @jest-environment jsdom
 */

import { screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import mockStore from "../__mocks__/store"
import BillsUI from "../views/BillsUI.js"
import { bills, fakeDateBills, nullStatusBills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import router from "../app/Router.js"
import Bills from "../containers/Bills.js"

describe("Given I am connected as an employee", () => {
  // afterEach(()=>document.body.innerHTML='')
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      // await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = await waitFor(() => screen.getByTestId('icon-window'))
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy()

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("Then click on 'new bill' should open new bill modal",async ()=>{
      document.body.innerHTML = BillsUI({ data: bills })

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null
        const bill = new Bills({
          document, onNavigate, store, bills, localStorage: window.localStorage
        })
      await waitFor(() => screen.getByTestId('btn-new-bill'))
      const newBillBtn=screen.getByTestId('btn-new-bill')
      const handleClickNewBill1 = jest.fn(e => bill.handleClickNewBill(e))
      
      newBillBtn.addEventListener('click', handleClickNewBill1)
      userEvent.click(newBillBtn)
      await waitFor(() => screen.getByTestId('form-new-bill') )
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
    })


    test("Then click on icon eye of a bill should open file modal", async ()=>{
      
      const onNavigate = pathname => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      })

      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      )

      const bill = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      })
      
      document.body.innerHTML = BillsUI({ data: bills });
      const modale = document.getElementById("modaleFile")
      const iconEyes = screen.getAllByTestId('icon-eye')
      $.fn.modal = jest.fn(() => modale.classList.add("show"))
      const handleClickIconEye = jest.fn(e=>bill.handleClickIconEye(e))
      iconEyes[0].addEventListener("click", () => handleClickIconEye(iconEyes[0]))
      userEvent.click(iconEyes[0])
      expect(handleClickIconEye).toHaveBeenCalled()
      expect(modale.classList.contains('show')).toBeTruthy()
    })

    test('getBills sorts the bills by date in descending order', async () => {
      document.body.innerHTML = BillsUI({ data: [bills[0]] })
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = {
        bills: jest.fn().mockReturnValue({
          list: jest.fn().mockResolvedValue([
            {"date": "30 Sep. 22", "status": undefined},
            {"date": "31 Déc. 21", "status": undefined}, 
            {"date": "30 Avr. 22", "status": undefined}, 
            ]),
        }),     };
      const bill = new Bills({
        document, onNavigate, store, bills, localStorage: window.localStorage
      })
    
      const getbills = await bill.getBills();
    
      expect(getbills).toEqual(expect.arrayContaining([
        {"date": "30 Sep. 22", "status": undefined}, 
        {"date": "30 Avr. 22", "status": undefined}, 
        {"date": "31 Déc. 21", "status": undefined}]
        ));
    });
  })
})


jest.mock("../app/store", () => mockStore);

// test d'intégration GET
describe("Given I am a user connected as employee", () => {
  
  describe("When I navigate to bills board", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId("tbody"))
      const icon  =  screen.getAllByTestId("icon-eye")
      expect(icon.length).toBeGreaterThan(0)
    })
  })

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    afterEach(() => document.body.innerHTML = "")
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick)
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
  
    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick)
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  
   

  })
})




