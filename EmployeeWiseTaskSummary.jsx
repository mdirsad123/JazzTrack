import React, { useMemo,useEffect, useState } from "react";

import {

  useGlobalFilter,
  usePagination,
  useSortBy,
  useTable,
  
} from "react-table";
import CardMenu from "components/card/CardMenu";
import Card from "components/card";
import Select from 'react-select';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next'; //By Md Irsad - 30-August-2024 (For Globalization)
import { exportDataToExcel, exportDataToPDF } from 'components/ExportUtils/ExportUtils';
import { FaFileExcel, FaFilePdf, FaListAlt } from "react-icons/fa"
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import { GrDocumentUser } from "react-icons/gr";


const EmployeeWiseTaskSummary = (props) => {

  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
  const [Token] = useState(Cookies.get("Token"));

  const [showRecordNotFound, setShowRecordNotFound] = useState('hidden');

  const [EmployeeWiseTaskSummarys, setEmployeeWiseTaskSummaryData] = useState([{}]);

  useEffect(() => {
    
    handleFilterButtonClick();
    fetchEmployeeName(loggedInCompanyId);
   
    }, []);

    //* /*****************************************8 */ */start download pdf or excel

    const [exportToExcelFlag, setExportToExcelFlag] = useState(0);
    const [exportToPDFFlag, setExportToPDFFlag] = useState(0)

    const handleExportToExcel = () => {
      setExportToExcelFlag(1);
    };
  
    const handleExportToPDF = () => {
      setExportToPDFFlag(1);
    };

    useEffect(() => {
      if (exportToExcelFlag === 1) {
        exportDataToExcel('tblEmpWiseTaskSummary', null, 'EmpWiseTaskSummaryList', [3,5,7,10,12,15,17]); // first array should be coulumn(action) or second Style-color
        setExportToExcelFlag(0);
      }
    }, [exportToExcelFlag]);
    
  
    useEffect(() => {
      if (exportToPDFFlag === 1) {
        exportDataToPDF('tblEmpWiseTaskSummary', null, 'EmpWiseTaskSummaryList', 'Employee Wise Task Summary List', 'l'); // Assuming 11, 12, 13 are the indices of header columns to be hidden
        setExportToPDFFlag(0);
      }
    }, [exportToPDFFlag]);
    
//************************* */


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
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    initialState,
  } = tableInstance;
  initialState.pageSize = 5;

  const [EmployeeId, setEmployeeId] = useState(0);
  const [EmployeeNameData, setEmployeeNameData] = useState([]);
  const selectedOption = { value: 0, label: "--Select Employee--" };
  const [SelectedEmployee, setEmployeeNameDropdown] = useState(selectedOption);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Adding 1 since getMonth() returns 0-based index
  const currentYear = currentDate.getFullYear();

  const [startingMonth, setStartingMonth] = useState({ value: currentMonth, label: getMonthName(currentMonth) });
  const [selectedMonthFilterRow, setselectedMonthFilterRow] = useState(null);
  const [Year, setYear] = useState(currentYear);
  const [ToDays, setToDays] = useState(0);

  const handleCheckboxChange = (event) => {
    setToDays(event.target.checked ? 1 : 0);
  };

  function getMonthName(monthNumber) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthNumber - 1]; // Subtracting 1 to get 0-based index
  }

  const [loggedInSessionId] = useState(Cookies.get("LoggedInSessionId"));
  const [loggedInCompanyId] = useState(Cookies.get("LoggedInCompanyId"));


  const handleEmployeeFilterChange = (event, value) => {
    setEmployeeNameDropdown(event);
    setEmployeeId(event.value);
    
}
  const handleMonthFilterChange = (value) => {

    const selectedValue = value["value"];

    setStartingMonth(selectedValue);
    setselectedMonthFilterRow(value);
  }
  const handleYearChangeEvent = (event) => {
    //alert(event.target.value);
    var ChangedYear = event.target.value;
    setYear(ChangedYear); 
  }
  const selectedMonthValue = selectedMonthFilterRow ? selectedMonthFilterRow.value : startingMonth.value;

  const handleFilterButtonClick = () => {

    if ((Year === '' || Year === 0) && ToDays === 0) {
      alert("Please Select Year");
      return; // Exit the function if the condition is met
    }

    const postData = {

      "CompanyId": loggedInCompanyId,
      "SessionId": loggedInSessionId,
      "ToDays": ToDays,
      "EmployeeId": EmployeeId,
      "Month": selectedMonthValue,
      "Year": Year,
      
    };
    const response = fetch('/EmployeeWiseTaskSummary/getEmployeeWiseTaskSummary', {
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
          setEmployeeWiseTaskSummaryData(data);
  
          console.log(data);
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
  };
  const fetchEmployeeName = (CompanyId) => {
    fetch("/ManagerDashboard/getSelectionEmployeeNameDropDown/"+CompanyId).then(
        res => res.json()
    ).then(
      data => {
        setEmployeeNameData(data);

        console.log(data);
      }
    )
  };

  return (
    <Card extra={"w-full h-full p-4"}>
      <div class="relative flex items-center justify-between">
        <div class="text-xl font-bold text-navy-700 dark:text-white" style={{ display: "inline-flex", alignItems: "center" }}>
          <GrDocumentUser className="mr-1" style={{ fontSize: '20px', color: "Blue" }} /> {t('Employee Wise Task Summary')}
        </div>
        <CardMenu />
      </div>
      <div className="w-half pr-4" style={{ height: "auto", width: "100%", display: "inline-block", padding: "10px", marginRight: "15px", borderColor: "silver", borderWidth: "1px" }}>

          <div className="relative items-center justify-between">
            <div className="mt-1 grid xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-12 lg:grid-cols-12">
            <div className="mt-2 text-sm md:col-span-2 gap-2 ">  
              <div style={{ display: "flex", alignItems: "center" }}>            
                <input
                  id="ToDay's" 
                  type="checkbox"
                  style={{ border : "solid 1px silver", width: "40px", borderRadius: "5px", height: "20px" }}
                  onChange={handleCheckboxChange}
                  checked={ToDays === 1}
                />
                <label htmlFor="todays" style={{ display: "inline-block", marginLeft: "5px", position: "relative" }}>{t("Today's")}</label>
              </div>
            </div>

            
                          

              <div className="mt-3 text-sm md:col-span-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
                <label htmlFor="ProjectName">{t('Employee')}</label>
              </div>
              <div className="mt-1 text-sm xs:col-span-2 md:col-span-2">

              <Select
                 
                 id="cmbEmployee"

                 value={SelectedEmployee}
                 onChange={handleEmployeeFilterChange}

                 options={[{ value: 0, label: t("--Select--") }, ...EmployeeNameData]}
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
              <div className="mt-3 text-sm md:col-span-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
                <label htmlFor="ProjectName">{t('Month')}</label>
              </div>

              <div className="mt-1 text-sm xs:col-span-2 md:col-span-2">
              <Select
                  id="cmbEmployee"
                  value={selectedMonthFilterRow || startingMonth}
                  onChange={handleMonthFilterChange}

                  options={[
                    { value: 0, label: t("--Select--") },
                    { value: 1, label: t("January") },
                    { value: 2, label: t("February") },
                    { value: 3, label: t("March") },
                    { value: 4, label: t("April")},
                    { value: 5, label: t("May")},
                    { value: 6, label: t("June")},
                    { value: 7, label: t("July")},
                    { value: 8, label: t("August")},
                    { value: 19, label: t("September")},
                    { value: 10, label: t("October")},
                    { value: 11, label: t("November")},
                    { value: 12, label: t("December")},
                    // Add more options as needed
                  ]}
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      backgroundColor: "var(--background-color)",
                      width: "70%"
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

              <div className="mt-1 text-sm xs:col-span-2 md:col-span-2">
              
              <select
                id="YEAR"
                style={{ border: "solid 1px silver", width: "50%", borderRadius: "5px", padding: "7px" }}
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
        <div className="mt-1 text-sm md:col-span-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
          
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
              table="tblEmpWiseTaskSummary"
              filename="departmentList"
              sheet="DepartmentList"
              buttonText={<><FaFileExcel className="cursor-pointer text-base text-green-500 hover:text-green-700 mr-1" /></>}
              
            />
          </div>

          <button onClick={handleExportToExcel} className="text-sm text-slate-400 hover:shadow-md border border-green-400 p-1 px-2 rounded-sm">
            <FaFileExcel className="cursor-pointer text-base text-green-500 hover:text-green-700 mr-1" /> {/* Adjust width, height, and color as needed */}
          </button>

          <button onClick={handleExportToPDF} className="text-sm text-slate-400 hover:shadow-md border border-red-400 p-1 px-2 rounded-sm">
            <FaFilePdf className="cursor-pointer text-base text-red-500 hover:text-red-700 mr-1" /> {/* Adjust width, height, and color as needed */}
          </button>
        </div>
      <CardMenu />
    </div>
      <div className="mt-1 h-full" style={{ paddingRight: "2px", width: "100%",marginLeft:'3px' }}>
      <div className="overflow-scroll sm:overflow-auto" style={{ height: "210px"}}>
          <table {...getTableProps()} id ="tblEmpWiseTaskSummary" className="w-full1">
            <thead style={{backgroundColor: "dark:transprent"}}>
              {headerGroups.map((headerGroup, index) => {
                return (

                  <tr {...headerGroup.getHeaderGroupProps()} key={index} className="bg-gray-300 dark:bg-navy-800" style={{ height: "50px" }}>
                    {headerGroup.headers.map((column, index) => {

                      let data = "";
                      if (column.render("Header") === "Id") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "100px" }}
                          >
                            <p className="text-sm tracking-wide dark:text-white text-black-600" style={{ marginLeft: '10px' }}>
                              #
                            </p>
                          </th>
                        );
                      } 

                      if (column.render("Header") === "Emp. Name") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "110px" }}
                          >
                            <p className="text-sm tracking-wide dark:text-white text-black-600">
                            {t("Emp. Name")}
                            </p>
                          </th>
                        );
                      } 
                      else if (column.render("Header") === "Pending") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "100px" }}>
                            <p className="text-sm tracking-wide dark:text-white text-black-600 text-center" >
                              {t("Pending")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "Allocated") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "90px" }}
                          >
                            <p className="text-sm tracking-wide dark:text-white text-black-600">
                            {t("Allocated")}
                            </p>
                          </th>
                        );
                      } 
                      else if (column.render("Header") === "InProgress") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "140px" }}>
                            <p className="text-sm tracking-wide dark:text-white text-black-600 text-center " >
                              {t("InProgress")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "Carry Forwarde") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "140px" }}>
                            <p className="text-sm tracking-wide dark:text-white text-black-600 text-center " >
                              {t("Carry FWD")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "Completed") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "140px" }}>
                            <p className="text-sm tracking-wide dark:text-white text-black-600 text-center" >
                              {t("Completed")}
                            </p>
                          </th>
                        );
                      }

                      else if (column.render("Header") === "Cancelled") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "140px" }}>
                            <p className="text-sm tracking-wide dark:text-white text-black-600 text-center" >
                              {t("Cancelled")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "Released") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "140px" }}>
                            <p className="text-sm tracking-wide dark:text-white text-black-600 text-center" >
                              {t("Released")}
                            </p>
                          </th>
                        );
                      }
                      
                      else if (column.render("Header") === "Allocated QC") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "140px" }}>
                            <p className="text-sm tracking-wide dark:text-white text-black-600 text-center" >
                              {t("AllocatedQC")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "Issue") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "140px" }}>
                            <p className="text-sm tracking-wide dark:text-white text-black-600 text-center" >
                              {t("Issue")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "QC Passed") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "140px" }}>
                            <p className="text-sm tracking-wide dark:text-white text-black-600 text-center" >
                              {t("QCPassed")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "Total") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "80px" }}>
                            <p className="text-sm tracking-wide dark:text-white text-black-600 text-center" >
                              {t("Total")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "ReAllocated") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "140px" }}>
                            <p className="text-sm tracking-wide dark:text-white text-black-600 text-center" >
                              {t("ReAllocated")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "OnTime") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "80px" }}>
                            <p className="text-sm tracking-wide dark:text-white text-black-600 text-center" >
                              {t("OnTime")}
                            </p>
                          </th>
                        );
                      }
                     
                      else if (column.render("Header") === "BeforeTime") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "80px" }}>
                            <p className="text-sm tracking-wide dark:text-white text-black-600 text-center" >
                              {t("BeforeTime")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "Delayed") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "80px" }}>
                            <p className="text-sm tracking-wide dark:text-white text-black-600 text-center" >
                              {t("Delayed")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "Overdue") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "100px" }}>
                            <p className="text-sm tracking-wide dark:text-white text-black-600 text-center" >
                              {t("Overdue")}
                            </p>
                          </th>
                        );
                      }
                      
                      return (
                        data
                      );

                    })}

                  </tr>
                );

              })}

            </thead>
            <tbody {...getTableBodyProps()}>
              {EmployeeWiseTaskSummarys.map((EmployeeWiseTaskSummary, index) => {
                return (
                  <tr key={index} style={{ backgroundColor: index % 2 ? 'whitesmoke dark:transparent' : 'white dark:transprent' }} >
                    {Object.keys(EmployeeWiseTaskSummary).map((keyElement, index1) => {
                      let data = "";

                     if(keyElement === "EmployeeWiseTSId") {
                      data = (
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-navy-700 dark:text-white text-center" style={{ width: "40px" }}>
                            {index+1}
                          </p>
                        </div>
                      );
                      } 
                      else if (keyElement === "EmployeeName") {
                        data = (
                          <p className="text-sm  text-navy-700 text-left dark:text-white" style={{ width: "110px",}}>
                             {EmployeeWiseTaskSummary.EmployeeCode} ({EmployeeWiseTaskSummary.EmployeeName})
                          </p>
                        );
                      }
                      else if (keyElement === "Pending") {
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "80px", backgroundColor: "Silver", color: "Black"}}>
                            {EmployeeWiseTaskSummary.Pending}
                          </p>
                        );
                      }
                     else if (keyElement === "Allocated") {
                       data = (
                         <p className="text-sm  text-navy-700 text-center dark:text-white" style={{ width: "80px", backgroundColor: "Blue", color: "White"}}>
                           {EmployeeWiseTaskSummary.Allocated}
                         </p>
                       );
                     }
                      else if (keyElement === "InProgress") {
                        data = (
                          <p className="text-sm  text-navy-700 dark:text-white text-center" style={{ width: "80px", backgroundColor: "Yellow", color: "Black"}}>
                            {EmployeeWiseTaskSummary.InProgress}
                          </p>
                        );
                      }
                      else if (keyElement === "CarryForward") {
                        data = (
                          <p className="text-sm  text-navy-700 dark:text-white text-center" style={{ width: "80px", backgroundColor: "Orange", color: "White"}}>
                            {EmployeeWiseTaskSummary.CarryForward}
                          </p>
                        );
                      }

                      else if (keyElement === "Completed") {
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "80px", backgroundColor: "lightgreen", color: "Black"}}>
                            {EmployeeWiseTaskSummary.Completed}
                          </p>
                        );
                      }
                      else if (keyElement === "Cancelled") {
                        data = (
                          <p className="text-sm  text-navy-700 text-center dark:text-white" style={{ width: "80px", backgroundColor: "red", color: "white" }}>
                            {EmployeeWiseTaskSummary.Cancelled}
                          </p>
                        );
                      }
                      else if (keyElement === "Released") {
                        data = (
                          <p className="text-sm  text-navy-700 text-center dark:text-white" style={{ width: "80px", backgroundColor: "LightGreen", color: "Black" }}>
                            {EmployeeWiseTaskSummary.Released}
                          </p>
                        );
                      }
                      
                      else if (keyElement === "AllocatedQC") {
                        data = (
                          <p className="text-sm  text-navy-700 text-center dark:text-white" style={{ width: "80px", backgroundColor: "Aqua", color: "Black" }}>
                            {EmployeeWiseTaskSummary.AllocatedQC}
                          </p>
                        );
                      }
                      else if (keyElement === "Issue") {
                        data = (
                          <p className="text-sm  text-navy-700 text-center dark:text-white" style={{ width: "80px", backgroundColor: "Brown", color: "white" }}>
                            {EmployeeWiseTaskSummary.Issue}
                          </p>
                        );
                      }
                      else if (keyElement === "QCPassed") {
                        data = (
                          <p className="text-sm  text-navy-700 text-center dark:text-white" style={{ width: "80px", backgroundColor: "Lime", color: "Black" }}>
                            {EmployeeWiseTaskSummary.QCPassed}
                          </p>
                        );
                      }
                      else if (keyElement === "Total") {
                        data = (
                          <p className="text-sm  text-navy-700 text-center dark:text-white" style={{ width: "80px", fontWeight: "bold" , backgroundColor: "Blue", color: "White"}}>
                            {EmployeeWiseTaskSummary.Total}
                          </p>
                        );
                      }
                      else if (keyElement === "ReAllocated") {
                        data = (
                          <p className="text-sm  text-navy-700 text-center dark:text-white" style={{ width: "80px", backgroundColor: "lightblue", color: "Black"}}>
                            {EmployeeWiseTaskSummary.ReAllocated}
                          </p>
                        );
                      }
                      else if (keyElement === "OnTime") {
                        data = (
                          <p className="text-sm  text-navy-700 text-center dark:text-white" style={{ width: "80px", backgroundColor: "lime", color: "Black"}}>
                            {EmployeeWiseTaskSummary.OnTime}
                          </p>
                        );
                      }
                      else if (keyElement === "BeforeTime") {
                        data = (
                          <p className="text-sm  text-navy-700 text-center dark:text-white" style={{ width: "80px", backgroundColor: "Green", color: "White" }}>
                            {EmployeeWiseTaskSummary.BeforeTime}
                          </p>
                        );
                      }
                      else if (keyElement === "Delay") {
                        data = (
                          <p className="text-sm  text-navy-700 text-center dark:text-white" style={{ width: "80px", backgroundColor: "#facc15", color: "Black"}}>
                            {EmployeeWiseTaskSummary.Delay}
                          </p>
                        );
                      }
                      else if (keyElement === "Overdue") {
                        data = (
                          <p className="text-sm  text-navy-700 text-center dark:text-white" style={{ width: "80px" , backgroundColor: "#b91c1c", color: "White"}}>
                            {EmployeeWiseTaskSummary.Overdue}
                          </p>
                        );
                      }

                      if (keyElement !== "EmployeeWiseTSId" && keyElement !== "EmployeeCode"
                      && keyElement !== "SessionId") {
                      return (
                        <td
                          className="pt-[14px] pb-[18px] sm:text-[10px]"
                          key={index1}
                        >
                          {data}
                        </td>
                      );
                      
                      }
                      
                    })}
                    
              
                    
                  </tr>
                );
              })}
              <tr style={{ visibility: showRecordNotFound }}>
                  <td className="text-center" colSpan="15" style={{ color: "red" }}>{t('No Record Found')}</td>
                </tr>
            </tbody>
          </table>
        </div>
      </div>

          </Card>
  );
};
const handleDelete = () => {
  // Implement your cancel logic here
};
export default EmployeeWiseTaskSummary;
