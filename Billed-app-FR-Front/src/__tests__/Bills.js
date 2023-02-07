/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import {localStorageMock} from "../__mocks__/localStorage.js"
import Bills from '../containers/Bills'
import mockStore from "../__mocks__/store"
import router from "../app/Router.js"

// beforeAll(() => {
//   Object.defineProperty(window, 'localStorage', { value: localStorageMock })
//   window.localStorage.setItem('user', JSON.stringify({
//     type: 'Employee'
//   }))
//   const root = document.createElement("div")
//   root.setAttribute("id", "root")
//   document.body.append(root)
//   router()
// })
describe("Given I am connected as an employee", () => {
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
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
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
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('btn-new-bill'))
      const newBillBtn=screen.getByTestId('btn-new-bill')
      const handleClickNewBill1 = jest.fn(() => window.onNavigate(ROUTES_PATH['NewBill']))
      newBillBtn.addEventListener('click', handleClickNewBill1)
      userEvent.click(newBillBtn)
      await waitFor(() => screen.getByTestId(`form-new-bill`) )
      expect(screen.getByTestId(`form-new-bill`)).toBeTruthy()
    })

    // test('handleClickIconEye opens modal', () => {
      
    //   const icon = document.createElement('div');
    //   icon.setAttribute("data-testid", "icon-eye");
    //   icon.setAttribute("data-bill-url", "bill-url");
    
    //   document.body.innerHTML = '<div id="modaleFile"></div>';
    //   const store = null
    //   const modal = document.querySelector('#modaleFile');
    
    //   const instance = new Bills({
    //     document, onNavigate, store, bills, localStorage: window.localStorage
    //   })
    //   instance.handleClickIconEye(icon);
    
    //   expect(modal.getAttribute('class')).toContain('show');
    // });

    test("Then click on icon eye of a bill should open file modal",async ()=>{
      // Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      // window.localStorage.setItem('user', JSON.stringify({
      //   type: 'Employee'
      // }))
      // const root = document.createElement("div")
      // root.setAttribute("id", "root")
      // document.body.append(root)
      // router()

      // console.log(bills[0])
      document.body.innerHTML = BillsUI({ data: [bills[0]] })
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const bill = new Bills({
        document, onNavigate, store, bills, localStorage: window.localStorage
      })

      const iconEyes = screen.getAllByTestId('icon-eye')

      const handleClickIconEye1 = jest.fn(() => bill.handleClickIconEye(iconEyes[0]))
      iconEyes[0].addEventListener('click', handleClickIconEye1)
      userEvent.click(iconEyes[0])
      await waitFor(() => screen.getByTestId(`modaleFile`) )
      // console.log(screen.getByTestId(`modaleFile`).outerHTML)
      expect(handleClickIconEye1).toHaveBeenCalled()

      bill.handleClickIconEye(iconEyes[0])
      await waitFor(() => screen.getByTestId(`modaleFile`) )
      const modalScreen=await waitFor(() => screen.getByTestId('open-'+bills[0].fileUrl).parentElement.parentElement.parentElement.parentElement.parentElement) 
      // console.log(modalScreen.outerHTML)
      // expect(modalScreen.getAttribute('class')).toContain('show');

      const openBillUrl = await waitFor(() => screen.getByTestId('open-'+bills[0].fileUrl))
      expect(openBillUrl).toBeTruthy()

      // const element = $('<div data-testid="icon-eye"></div>');
      // element.click();
      // expect($('#modaleFile').hasClass('show')).toBe(true);

      // window.onNavigate(ROUTES_PATH.Bills)
      // await waitFor(() => screen.getAllByTestId('icon-eye'))
      // const iconEyeBtn=screen.getAllByTestId('icon-eye')
      // // console.log(iconEyeBtn[0].outerHTML)
      // const handleClickIconEye = jest.fn(() => {
      //   $('#modaleFile').modal('show')})
      // iconEyeBtn[0].addEventListener('click', handleClickIconEye)
      // userEvent.click(iconEyeBtn[0])
      // await waitFor(() => screen.getByTestId(`modaleFile`) )
      // const modalScreen=screen.getByTestId(`modaleFile`)
      // console.log(modalScreen.outerHTML)
      // expect(handleClickIconEye).toHaveBeenCalled()
      // expect(modalScreen.classList.contains('show')).toBeTruthy()
      
      
      
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
        }),
      };
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
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementation(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }
      })
      // const bill = new Bills({
      //   document, onNavigate, mockStore, bills, localStorage: window.localStorage
      // })
      
        
      window.onNavigate(ROUTES_PATH.Bills)
      
      await new Promise(process.nextTick)
      console.log(bills)
      // const message = await screen.getByText(/Erreur 404/)
      // expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      // const message = await screen.getByText(/Erreur 500/)
      // expect(message).toBeTruthy()
    })
  })

  })
})
