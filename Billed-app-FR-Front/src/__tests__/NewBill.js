/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
    })
  })

  // describe("When I upload a new file", () => {
  //   test("Then ...", () => {
  //     const html = NewBillUI()
  //     document.body.innerHTML = html

  //     const inputFile = screen.getByTestId("file");
  //     inputFile.file[0]='c:\testfil.pdf'

      
      
  //   })
  // })
})
