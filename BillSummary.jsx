import React, { useMemo,useEffect, useState } from "react";

import {

  useGlobalFilter,
  usePagination,
  useSortBy,
  useTable,
  
} from "react-table";
import Modal from 'react-modal';
import CardMenu from "components/card/CardMenu";
import Card from "components/card";
import Select from 'react-select';
import Cookies from 'js-cookie';
import {
  MdTask,
  MdEmail

} from "react-icons/md";
import { useTranslation } from 'react-i18next'; //By Md Irsad - 30-August-2024 (For Globalization)

import { exportDataToExcel, exportDataToPDF } from 'components/ExportUtils/ExportUtils';
import { FaFileExcel, FaFilePdf, FaListAlt } from "react-icons/fa"
import ReactHTMLTableToExcel from 'react-html-table-to-excel';

const TaskSummary = (props) => {
  

  //* /*****************************************8 */ */start download pdf or excel

  const [exportToExcelFlag, setExportToExcelFlag] = useState(0);
  const [exportToPDFFlag, setExportToPDFFlag] = useState(0)

  const handleExportToExcelForReceipt = () => {
    setExportToExcelFlag(1);
  };

  const handleExportToPDFForReceipt = () => {
    setExportToPDFFlag(1);
  };

  useEffect(() => {
    if (exportToExcelFlag === 1) {
      exportDataToExcel('tblBillSummaryReceiptPopup', [], 'TotalReceveList', [7]); // first array should be coulumn(action) or second Style-color
      setExportToExcelFlag(0);
    }
  }, [exportToExcelFlag]);
  

  useEffect(() => {
    if (exportToPDFFlag === 1) {
      exportDataToPDF('tblBillSummaryReceiptPopup', [], 'TotalReceveList', 'Total Receive List', 'l'); // Assuming 11, 12, 13 are the indices of header columns to be hidden
      setExportToPDFFlag(0);
    }
  }, [exportToPDFFlag]);

  const [exportToExcelFlagForBill, setExportToExcelFlagForBill] = useState(0);
  const [exportToPDFFlagForBill, setExportToPDFFlagForBill] = useState(0)

  const handleExportToExcelForBill = () => {
    setExportToExcelFlagForBill(1);
  };

  const handleExportToPDFForBill = () => {
    setExportToPDFFlagForBill(1);
  };

  useEffect(() => {
    if (exportToExcelFlagForBill === 1) {
      exportDataToExcel('tblBillSummaryBillPopup', [], 'TotalBillList', [8]); // first array should be coulumn(action) or second Style-color
      setExportToExcelFlagForBill(0);
    }
  }, [exportToExcelFlagForBill]);
  

  useEffect(() => {
    if (exportToPDFFlagForBill === 1) {
      exportDataToPDF('tblBillSummaryBillPopup', [], 'TotalBillList', 'Total Bill List', 'l'); // Assuming 11, 12, 13 are the indices of header columns to be hidden
      setExportToPDFFlagForBill(0);
    }
  }, [exportToPDFFlagForBill]);
  
//************************* */

  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
  const [Token] = useState(Cookies.get("Token"));

  const [showRecordNotFound, setShowRecordNotFound] = useState('hidden');

  const [BillSummarys, setBillSummaryData] = useState([{}]);

  const [currencyId] = useState(Cookies.get("LoggedInCurrencyId"));
  // const [currencyId] = useState('1');
  
  const getCurrencyIcon = (id) => {
    switch(id) {
      case '1':
        return '₹'; // or use '\u20B9' for the Rupee symbol
      case '2':
        return '$';
      case '3':
        return 'د.إ'; // Dirham symbol
      default:
        return '';
    }
  };
  const CurrencyIcon = getCurrencyIcon(currencyId);

  useEffect(() => {
    // setManagerId(loggedInRoleId === "2" ? loggedInCustomerId : 0);

    handleFilterButtonClick();
    fetchCustomerOptions();

   
    }, []);


  const { columnsData, tableData } = props;
  const [sortBy, setSortBy] = useState(null);

  const toggleSortOrder = () => {
    setSortBy(sortBy === 'asc' ? 'desc' : 'asc');
  };

  // Function to sort the data based on the "Sr No." column
  const sortData = (data) => {
    if (sortBy === 'asc') {
      return data.sort((a, b) => a.HistoryId - b.HistoryId);
    } else if (sortBy === 'desc') {
      return data.sort((a, b) => b.HistoryId - a.HistoryId);
    } else {
      return data;
    }
  };

  const extraColumn = {
    Header: "Action",
    accessor: "action",

    
  };

  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updatedColumns = useMemo(() => [...columnsData, extraColumn], [
    columnsData,
  ]);
  
  const columns = useMemo(() => updatedColumns, [updatedColumns]);
  const data = useMemo(() => tableData, [tableData]);

  const tableInstance = useTable(
    {
      columns,
      data,
      
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const {
    initialState,
  } = tableInstance;
  initialState.pageSize = 5;
  
  const [CustomerDropDownData, setCustomerDropDownData] = useState([]);
  const [CustomerId, setCustomerId] = useState(0);
  const selectedOption = { value: 0, label: "--Select--" };
  const [SelectedCustomer, setCustomer] = useState(selectedOption);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Adding 1 since getMonth() returns 0-based index
  const currentYear = currentDate.getFullYear();

  const [Year, setYear] = useState(currentYear);
  const [ToDays, setToDays] = useState(0);

  const [OpenPopupModalFlag, OpenPopupModal] = useState(false);
  const [BillSummaryCountData, setBillSummaryCountData] = useState([{}]);
  const [OpenReceivePopupModalFlag, OpenReceivePopupModal] = useState(false);
  const [ReceiveSummaryCountData, setReceiveSummaryCountData] = useState([{}]);


  function getMonthName(monthNumber) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthNumber - 1]; // Subtracting 1 to get 0-based index
  }

  // const loggedInRoleId = Cookies.get("LoggedInRoleId");
  // const loggedInCustomerId = Cookies.get("LoggedInCustomerId");
  const [loggedInSessionId] = useState(Cookies.get("LoggedInSessionId"));
  const [loggedInCompanyId] = useState(Cookies.get("LoggedInCompanyId"));
  const [loggedInUserId] = useState(Cookies.get('LoggedInUserId'));
  // const [ManagerId, setManagerId] = useState(0);


  const handleCloseButtonClick = () => {
    OpenPopupModal(false)
  };
  const handleCloseButtonClickForReceive = () => {
    OpenReceivePopupModal(false)
  };

  const handleCustomerFilterChange = (event, value) => {
    setCustomer(event);
    setCustomerId(event.value);
}
  const handleYearChangeEvent = (event) => {
    //alert(event.target.value);
    var ChangedYear = event.target.value;
    setYear(ChangedYear); 
  }
  const selectedMonthValue = 1;

  const handleFilterButtonClick = () => {

    if ((Year === '' || Year === 0)) {
      alert("Please Select Year");
      return;
    }

    const postData = {
      "CompanyId": loggedInCompanyId,
      "SessionId": loggedInSessionId,
      "CustomerId": CustomerId,
      "Year": Year,
      "UserId": loggedInUserId
      
    };
    const response = fetch('/BillSummary/getBillSummary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Token}`,
        },
        body: JSON.stringify(postData)
      }).then(
        res => res.json()
      ).then(
        data => {
          setBillSummaryData(data);
        }
      );
  };

  const fetchCustomerOptions = () => {

    fetch("/project/getCustomerNameForDropDown/"+ loggedInCompanyId).then(
      res => res.json()
    ).then(
      data => {
        setCustomerDropDownData(data);

        console.log(data);
      }
    )
  };
  const [BillCountClickStatus, setBillCountClickStatus] = useState("");

  useEffect(() => {
    // handleBillPopupButtonClick(BillCountClickStatus);
   
    }, [BillCountClickStatus]);

  const handleBillPopupButtonClick = (Status) => {
    setBillCountClickStatus(Status);

    // alert(BillCountClickStatus);
    const postData = {
      "CompanyId": loggedInCompanyId,
      "Status": Status,
      "CustomerId": CustomerId,
      "Year": Year,
      "UserId": loggedInUserId
      
    };
    const response = fetch('/billSummary/getCountBillummaryList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Token}`,
        },
        body: JSON.stringify(postData)
      }).then(
        res => res.json()
      ).then(
        data => {
          setBillSummaryCountData(data);

          if (Object.keys(data).length !== 0){
            //alert('data not null');
            setShowRecordNotFound("collapse");
          }
          else{
            //alert('data null');
            setShowRecordNotFound("visible");
          }
          
        }
      );
    OpenPopupModal(true);

  };
  const handleReceivePopupButtonClick = (Status) => {
    setBillCountClickStatus(Status);

    // alert(BillCountClickStatus);
    const postData = {
      "CompanyId": loggedInCompanyId,
      "Status": Status,
      "CustomerId": CustomerId,
      "Year": Year,
      "UserId": loggedInUserId
      
    };
    const response = fetch('/billSummary/getCountBillummaryListForReceive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Token}`,
        },
        body: JSON.stringify(postData)
      }).then(
        res => res.json()
      ).then(
        data => {
          setReceiveSummaryCountData(data);

          if (Object.keys(data).length !== 0){
            //alert('data not null');
            setShowRecordNotFound("collapse");
          }
          else{
            //alert('data null');
            setShowRecordNotFound("visible");
          }
          
        }
      );
    OpenReceivePopupModal(true);

  };

  const getStatusColor = (status) => {
    // Define background colors for different status values
    const statusColors = {
      IG: 'Aqua',
      CAN: 'Red',
      G: 'Aqua',
      E: 'Orange'
    };

    if (status === undefined) {
      status = "";
    }
    var trimmedStatus = status.replace(' ', '');
    trimmedStatus = trimmedStatus.replace('-', '');

    return statusColors[trimmedStatus] || 'silver'; // Default color is gray
  
  };

  const getStatusTextColor = (status) => {
    // Define text colors for different status values
    const statusTextColors = {
      IG: 'Black',
      CAN: 'white',
      G: 'Black',
      E: 'Black'
    };

    if (status === undefined) {
      status = "";
    }
    var trimmedStatus = status.replace(' ', '');
    trimmedStatus = trimmedStatus.replace('-', '');

    // Use the color for the text color of corresponding status, or a default color if not found
    return statusTextColors[trimmedStatus] || 'white'; // Default color is white
  };

  return (
    <Card extra={"w-full h-full p-4 -ml-4"}>
      <div class="relative flex items-center justify-between">
        <div class="text-xl font-bold text-navy-700 dark:text-white" style={{ display: "inline-flex", alignItems: "center" }}>
        <MdTask className="mr-1" style={{ fontSize: '20px', color: "Blue" }} /> {t('Bill Summary')}
        </div>
        <CardMenu />
      </div>
      
      <div className="mt-1 h-half grid-cols-3 gap-3 md:grid-cols-1" >
        <div className="w-half pr-4" style={{ height: "auto", width: "100%", display: "inline-block", padding: "10px", marginRight: "15px", borderColor: "silver", borderWidth: "1px" }}>

          <div className="relative items-center justify-between">
            <div className="mt-1 grid xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-12 lg:grid-cols-12">

              <div className="mt-3 text-sm md:col-span-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
                <label htmlFor="ProjectName">{t('Customer')}</label>
              </div>
              <div className="mt-1 text-sm xs:col-span-4 md:col-span-4">

                <Select
                 
                  id="cmbEmployee"

                  value={SelectedCustomer}
                  onChange={handleCustomerFilterChange}

                  options={[{ value: 0, label: t("--Select--") }, ...CustomerDropDownData]}
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      backgroundColor: "var(--background-color)",
                      width: "90%"
                    }),
                    menu: (provided) => ({
                      ...provided,
                      backgroundColor: "white",
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isSelected
                        ? "var(--primary-color)"
                        : "var(--background-color)",
                      color: state.isSelected ? "light" : "var(--text-color)",
                    }),
                  }}
                />
              </div>
              
              <div className="mt-3 text-sm md:col-span-1  xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
                <label htmlFor="LeaveName">{t('Year')}</label><label style={{ color: "red" }}>*</label>
              </div>

              <div className="mt-1 text-sm xs:col-span-3 md:col-span-3">
              
              <select
                id="YEAR"
                style={{ border: "solid 1px silver", width: "90%", borderRadius: "5px", padding: "7px" }}
                value={Year}
                onChange={handleYearChangeEvent}
              >
                <option value="">{t('--Select--')}</option>
                
                {/* Add options for each year */}
                {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}

              </select>
                
              </div>
              <div className="mt-1 text-sm xs:col-span-1 md:col-span-1">
                  <button className="btn" style={{ padding: '10px 10px', border: '1px solid #ccc', borderRadius: '10px', backgroundColor: 'MediumSeaGreen', color: 'white' }} onClick={handleFilterButtonClick}>
                    {t('Search')}
                  </button>
                </div>
            </div>
          </div>
          
        </div>
        <div className="mt-2 text-sm md:col-span-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
          <div className="mt-1 text-sm xs:col-span-1 md:col-span-1">
          </div>
        </div>
      </div>

      <div className="flex flex-wrap pr-4 " style={{ height: "auto",  padding: "20px", borderColor: "silver", borderWidth: "1px" }}>
        
        <div className="md: w-full">
          <button className="side-box-container text-center" style={{width: "28%", display: "inline-block", padding: "20px", marginRight: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "Blue"}} onClick={() => handleBillPopupButtonClick("Total")}>
            <div className="header-box">
            <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "White", background: "none", border: "none", cursor: "pointer" }}>
              {t('Total Bills')}
            </button>

            </div>
            <div className="data-box text-center" style={{ color: "White" }}>
              {BillSummarys[0].TotalBill}
            </div>
          </button>
              <button className="side-box-container text-center" style={{width: "28%", display: "inline-block", padding: "20px",marginRight: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "brown", color: "white"}} onClick={() => handleBillPopupButtonClick("TotalCancelBill")}>                                           
                  <div className="header-box">
                    <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "White" }}>
                    {t('Total Cancelled')}
                    </button>
                  </div>
                  <div className="data-box text-center" style={{color: "White"}}>
                  {BillSummarys[0].TotalCancelBIll}
                  </div>
              </button>
            <button className="side-box-container text-center" style={{width: "28%", display: "inline-block", padding: "20px",marginRight: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "red", color: "white"}} onClick={() => handleBillPopupButtonClick("TotalCancelBillAmt")}>                                           
              <div className="header-box">
                <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "White" }}>
                {t('Cancelled Amt')}
                </button>
              </div>
              <div className="data-box text-center" style={{color: "White"}}>
              {CurrencyIcon} {BillSummarys[0].TotalCancelBillAmt}
              </div>
          </button>

          </div>
          <div className="mt-2 md: w-full">
          <button className="side-box-container text-center" style={{width: "28%", display: "inline-block", padding: "20px",marginRight: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "Yellow", color: "Black"}} onClick={() => handleBillPopupButtonClick("BA")}>                                           
            <div className="header-box">
              <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "Black" }}>
              {t('Bill Amount')}
              </button>
            </div>
            <div className="data-box text-center" style={{color: "Black"}}>
            {CurrencyIcon} {BillSummarys[0].TotalBillAmt}
            </div>
          </button>
          <button className="side-box-container text-center" style={{width: "28%", display: "inline-block", padding: "20px",marginRight: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "lightgreen"}} onClick={() => handleReceivePopupButtonClick("ReceiveAmt")}>                                           
              <div className="header-box">
                <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "Black" }}>
                {t('Total Received')}
                </button>
              </div>
              <div className="data-box text-center" style={{color: "Black"}}>
              {CurrencyIcon} {BillSummarys[0].TotalReceiveAmt}
              </div>
          </button>
          <button className="side-box-container text-center" style={{width: "28%", display: "inline-block", padding: "20px",marginRight: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "Orange"}} onClick={() => handleBillPopupButtonClick("Balance")}>                                           
              <div className="header-box">
                <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "White" }}>
                  {t('Balance')}
                </button>
              </div>
              <div className="data-box text-center" style={{color: "White"}}>
              {CurrencyIcon} {BillSummarys[0].Balance}
              </div>
          </button>
          
        </div>  
        
      </div>
      {/*  bill Popup modal start from here */}
      <Modal
            isOpen={OpenPopupModalFlag}
            onRequestCancel={handleCloseButtonClick}
            contentLabel="Action Modal"
            style={{
              overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: "999"
              },
              content: {
                
                top: '50%',
                left: '55%',
                transform: 'translate(-50%, -50%)',
                width: '1100px', // Adjust the width as needed
                maxHeight: '750px',
                minHeight:"300px",
                height:"auto",
                padding: '10px',
                boxShadow: '0px 0px 100px rgba(0, 0, 0, 0.1)',
                borderRadius: '5px',
                overflow:true,
                position: "relative"
              },
            }}
             >
              
              <div>
                  {/* <div>
                  <button
                        onClick={handleCloseButtonClick}
                        style={{
                          border: 'none',
                          background: 'none',
                          fontSize: '20px',
                          cursor: 'pointer',
                          color:'Red'
                        }}
                      >
                      X
                      </button>
                  </div> */}
                
          <div className="grid grid-cols-2" style={{ fontSize: '18px', fontWeight: "bold", color: 'black', backgroundColor: 'Silver', marginBottom: '5px', padding: '10px', borderRadius: " 10px" }}>
          <div className="text-xl dark:text-white" style={{ fontWeight: "bold" }}>{BillCountClickStatus==='Total'? t("Total Bills"):BillCountClickStatus==='BA'? t("Bills"):BillCountClickStatus==='ReceiveAmt'? t("Received List"):BillCountClickStatus==='Balance'? t("Balance List"):t("Bill List")} </div>
            <div className="" style={{ display: 'flex', justifyContent: 'flex-end', }}>
              <button
                onClick={handleCloseButtonClick}
                style={{
                  border: 'none',
                  background: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: 'Red'
                }}
              >
                X
              </button>
            </div>
          </div>
          <div className="relative flex items-center justify-between">
            <div className="text-xl text-navy-700 dark:text-white mr-auto">
              {/* <u style={{fontWeight:"bold"}}>Leave Summary List</u> */}
            </div>
            <div className="flex space-x-2" style={{ paddingRight: "2.5%" }}>
                
                <div className="text-sm text-slate-400 hover:shadow-md border border-green-400 p-1 px-2 rounded-sm text-center item-center" 
                style={{width:"40px", padding: '7px 5px', visibility:"collapse" }}>
                  <ReactHTMLTableToExcel
                    id="test-table-xls-button"
                    table="tblBillSummaryBillPopup"
                    buttonText={<><FaFileExcel className="cursor-pointer text-base text-green-500 hover:text-green-700 mr-1" /></>}
                    
                  />
                </div>

                <button onClick={handleExportToExcelForBill} className="text-sm text-slate-400 hover:shadow-md border border-green-400 px-2 rounded-sm">
                  <FaFileExcel className="cursor-pointer text-base text-green-500 hover:text-green-700 mr-1" /> {/* Adjust width, height, and color as needed */}
                </button>

                <button onClick={handleExportToPDFForBill} className="text-sm text-slate-400 hover:shadow-md border border-red-400 px-2 rounded-sm">
                  <FaFilePdf className="cursor-pointer text-base text-red-500 hover:text-red-700 mr-1" /> {/* Adjust width, height, and color as needed */}
                </button>
              </div>
            <CardMenu />
          </div>
          <div className="p-1 overflow-x-scroll sm:overflow-x-auto" style={{ width: '100%', height: "auto",minHeight:"250px",  maxHeight: "500px" }}>
            <table id='tblBillSummaryBillPopup' style={{ width: '100%' }}>
              <thead>
                <tr className="text-sm" style={{ backgroundColor: 'Silver', borderRadius: '6px', width: "100px" }}>
                  <th style={{ padding: '10px 0px' }}>
                    {t('Sr No.')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Invoice No')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Invoice Date')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Invoice Against')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Customer')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Invoice Amount')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Receive Amt')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Balance Amt')}
                  </th>
                  <th style={{ padding: '10px 10px' }} onClick={toggleSortOrder}>
                    {t('Status')}
                  </th>
                  
                </tr>
              </thead>
              <tbody style={{ width: '100%' }}>
                {sortData(BillSummaryCountData).map((CountData, index) => {
                  return (
                    <tr key={index} style={{ backgroundColor: index % 2 ? 'whitesmoke' : 'white' }}>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "50px" }}>{index + 1}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "170px", textAlign: "center" }}>{CountData.InvoiceNo}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "170px", textAlign: "center" }}>{CountData.InvoiceDateFormatted}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "220px", textAlign: "center" }}>{CountData.InvoiceAgainst}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "140px", textAlign: "center" }}>{CountData.CustomerName}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "140px", textAlign: "center" }}>{CurrencyIcon} {CountData.InvoiceAmt}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "140px", textAlign: "center" }}>{CurrencyIcon} {CountData.ReceivedAmt}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "140px", textAlign: "center" }}>{CurrencyIcon} {CountData.BalanceAmt}</td>

                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "140px" }}>
                        <div className={`flex items-center justify-center rounded-full`} style={{ width: '98%', margin: "0 auto", backgroundColor: getStatusColor(CountData.Status), height: '2em' }}>
                          <span style={{ color: getStatusTextColor(CountData.Status), fontSize: '12px' }}>{CountData.StatusName}</span>
                        </div>
                      </td>

                    </tr>
                  );
                })}

                <tr style={{ visibility: showRecordNotFound }}>
                  <td className="text-center" colSpan="8" style={{ color: "red" }}>{t('No Record Found')}</td>
                </tr>

              </tbody>
            </table>
          </div>
          <div style={{ bottom: '10px', textAlign: "center" }}>
            <button onClick={handleCloseButtonClick} style={{ padding: '10px 20px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: 'Orange', color: 'white' }}>{t('Close')}</button>
          </div>
        </div>
                
      </Modal>

      {/* Receive Popup modal start from here */}
      <Modal
            isOpen={OpenReceivePopupModalFlag}
            onRequestCancel={handleCloseButtonClickForReceive}
            contentLabel="Action Modal"
            style={{
              overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: "999"
              },
              content: {
                
                top: '50%',
                left: '58%',
                transform: 'translate(-50%, -50%)',
                width: '1200px', // Adjust the width as needed
                maxHeight: '750px',
                minHeight:"300px",
                height:"auto",
                padding: '10px',
                boxShadow: '0px 0px 100px rgba(0, 0, 0, 0.1)',
                borderRadius: '5px',
                overflow:true,
                position: "relative"
              },
            }}
             >
              
              <div>
                
          <div className="grid grid-cols-2" style={{ fontSize: '18px', fontWeight: "bold", color: 'black', backgroundColor: 'Silver', marginBottom: '5px', padding: '10px', borderRadius: " 10px" }}>
          <div className="text-xl dark:text-white" style={{ fontWeight: "bold" }}>{t('Received Amount')}</div>
            <div className="" style={{ display: 'flex', justifyContent: 'flex-end', }}>
              <button
                onClick={handleCloseButtonClickForReceive}
                style={{
                  border: 'none',
                  background: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: 'Red'
                }}
              >
                X
              </button>
            </div>
          </div>
          <div className="relative flex items-center justify-between">
            <div className="text-xl text-navy-700 dark:text-white mr-auto">
              {/* <u style={{fontWeight:"bold"}}>Leave Summary List</u> */}
            </div>
            <div className="flex space-x-2" style={{ paddingRight: "2.5%" }}>
                
                <div className="text-sm text-slate-400 hover:shadow-md border border-green-400 p-1 px-2 rounded-sm text-center item-center" 
                style={{width:"40px", padding: '7px 5px', visibility:"collapse" }}>
                  <ReactHTMLTableToExcel
                    id="test-table-xls-button"
                    table="tblBillSummaryReceiptPopup"
                    filename="departmentList"
                    sheet="DepartmentList"
                    buttonText={<><FaFileExcel className="cursor-pointer text-base text-green-500 hover:text-green-700 mr-1" /></>}
                    
                  />
                </div>

                <button onClick={handleExportToExcelForReceipt} className="text-sm text-slate-100 hover:shadow-md border border-green-400 px-2 rounded-sm">
                  <FaFileExcel className="cursor-pointer text-base text-green-500 hover:text-green-100 mr-1" /> {/* Adjust width, height, and color as needed */}
                </button>

                <button onClick={handleExportToPDFForReceipt} className="text-sm text-slate-400 hover:shadow-md border border-red-400 px-2 rounded-sm">
                  <FaFilePdf className="cursor-pointer text-base text-red-500 hover:text-red-700 mr-1" /> {/* Adjust width, height, and color as needed */}
                </button>
              </div>
            <CardMenu />
          </div>

          <div className="p-1 overflow-x-scroll-auto sm:overflow-x-scroll-auto" style={{ width: '100%', height: "auto",minHeight:"250px",  maxHeight: "500px" }}>
            <table id ="tblBillSummaryReceiptPopup" style={{ width: '100%' }}>
              <thead>
                <tr className="text-sm" style={{ backgroundColor: 'Silver', borderRadius: '6px', width: "100px" }}>
                  <th style={{ padding: '10px 0px' }}>
                    {t('Sr No.')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Receipt No')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Receipt Date')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Received From')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Received Amount')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Receipt Details')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Invoice No')}
                  </th>
                  <th style={{ padding: '10px 10px' }} onClick={toggleSortOrder}>
                    {t('Status')}
                  </th>
                  
                </tr>
              </thead>
              <tbody style={{ width: '100%' }}>
                {sortData(ReceiveSummaryCountData).map((CountData, index) => {
                  return (
                    <tr key={index} style={{ backgroundColor: index % 2 ? 'whitesmoke' : 'white' }}>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "50px" }}>{index + 1}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "170px", textAlign: "center" }}>{CountData.ReceiptsNo}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "170px", textAlign: "center" }}>{CountData.ReceiptDateFormated}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "220px", textAlign: "center" }}>{CountData.CustomerName}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "140px", textAlign: "center" }}>{CurrencyIcon} {CountData.ReceiptAmt}</td>
                      <td
                        className="text-sm text-navy-700 dark:text-white"
                        style={{ padding: '10px', width: "240px", textAlign: "center" }}
                      >
                        {CountData.PaymentMode}
                        <div style={{ width: '100%', marginTop: '5px', lineHeight: '1.5' }}>
                          {CountData.PaymentMode === 'Cheque' && (
                            <>
                              {t('CHQ No')}: <span>{CountData.TransNo}</span>
                              <br />
                              {t('CHQ Date')}: <span>{CountData.TransDate}</span>
                            </>
                          )}
                          {CountData.PaymentMode === 'Demand Draft' && (
                            <>
                              {t('DD No')}: <span>{CountData.TransNo}</span>
                              <br />
                              {t('DD Date')}: <span>{CountData.TransDate}</span>
                            </>
                          )}
                          {CountData.PaymentMode === 'Online Transaction' && (
                            <>
                              {t('Trans No')}: <span>{CountData.TransNo}</span>
                              <br />
                              {t('Trans Date')}: <span>{CountData.TransDate}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "140px", textAlign: "center" }}>{CountData.InvoiceNo}</td>

                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "140px" }}>
                        <div className={`flex items-center justify-center rounded-full`} style={{ width: '98%', margin: "0 auto", backgroundColor: getStatusColor(CountData.Status), height: '2em' }}>
                          <span style={{ color: getStatusTextColor(CountData.Status), fontSize: '12px' }}>{CountData.StatusName}</span>
                        </div>
                      </td>

                    </tr>
                  );
                })}

                <tr style={{ visibility: showRecordNotFound }}>
                  <td className="text-center" colSpan="8" style={{ color: "red" }}>{t('No Record Found')}</td>
                </tr>

              </tbody>
            </table>
          </div>
          <div style={{ bottom: '10px', textAlign: "center" }}>
            <button onClick={handleCloseButtonClickForReceive} style={{ padding: '10px 20px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: 'Orange', color: 'white' }}>{t('Close')}</button>
          </div>
        </div>
                
      </Modal>

          </Card>
  );
};

export default TaskSummary;
