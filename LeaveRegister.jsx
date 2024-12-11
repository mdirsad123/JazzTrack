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
import { MdInsertChartOutlined } from "react-icons/md";
import { useTranslation } from 'react-i18next'; //By Md Irsad - 30-August-2024 (For Globalization)
import { exportDataToExcel, exportDataToPDF } from 'components/ExportUtils/ExportUtils';
import { FaFileExcel, FaFilePdf, FaListAlt } from "react-icons/fa"
import ReactHTMLTableToExcel from 'react-html-table-to-excel';

const getLeaveTypeColor = (status) => {
  // Define colors for different status values
  const statusColors = {
    CL: 'LightBlue',
    PL: 'Lime',
    SL: 'orange', 
    ML: 'Green',
    CO: 'Yellow',
    HD: 'Orange'
    
    // Add more status-color mappings as needed
  };

  if (status === undefined){
    status = "";
  }
 
  var trimmedStatus = status.replace(' ', '');
  trimmedStatus = trimmedStatus.replace('-', '');
  
  // Use the color for the corresponding status, or a default color if not found
  return statusColors[trimmedStatus] || ""; // Default color is gray
};

const getLeaveTypeTextColor = (status) => {
  // Define colors for different status values
  const statusColors = {
    CL: 'black',
    PL: 'black',
    SL: 'white', 
    ML: 'white',
    CO: 'black',
    HD: 'Black',
    
    // Add more status-color mappings as needed
  };

  if (status === undefined) {
    status = "";
  }
  
  var trimmedStatus = status.replace(' ', '');
  trimmedStatus = trimmedStatus.replace('-', '');

  // Use the color for the corresponding status, or a default color if not found
  return statusColors[trimmedStatus] || ''; // Default color is gray
};
const getLeaveCodeColor = (status) => {
  // Define colors for different status values
  const statusColors = {
    HD: 'Orange',
    
    // Add more status-color mappings as needed
  };

  if (status === undefined){
    status = "";
  }
 
  var trimmedStatus = status.replace(' ', '');
  trimmedStatus = trimmedStatus.replace('-', '');
  
  // Use the color for the corresponding status, or a default color if not found
  return statusColors[trimmedStatus] || ""; // Default color is gray
};

const getLeaveCodeTextColor = (status) => {
  // Define colors for different status values
  const statusColors = {
    HD: 'White',
    
    // Add more status-color mappings as needed
  };

  if (status === undefined) {
    status = "";
  }
  
  var trimmedStatus = status.replace(' ', '');
  trimmedStatus = trimmedStatus.replace('-', '');

  // Use the color for the corresponding status, or a default color if not found
  return statusColors[trimmedStatus] || ''; // Default color is gray
};


const LeaveRegister = (props) => {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
  const [Token] = useState(Cookies.get("Token"));
  
  const [loggedInSessionId] = useState(Cookies.get("LoggedInSessionId"));
  const [loggedInCompanyId] = useState(Cookies.get("LoggedInCompanyId"));
  
  const handleExportExcel = () => {
    // Logic for exporting to Excel
  };

  const handleExportPdf = () => {
    // Logic for exporting to PDF
  };

  const [showRecordNotFound, setShowRecordNotFound] = useState('hidden');

  const [LeaveRegisters, setLeaveRegisterData] = useState([{}]);

  useEffect(() => {
    //alert('getTimeSheetEntryData');
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
        exportDataToExcel('tblLeaveRegsiter', null, 'LeaveRegisterList', [4,6,8,9,10,11,12,13,14,15,16,17,18,20,21,22,23,26,27,28,29,30,31,32,33]); // first array should be coulumn(action) or second Style-color

        setExportToExcelFlag(0);
      }
    }, [exportToExcelFlag]);
    
  
    useEffect(() => {
      if (exportToPDFFlag === 1) {
        exportDataToPDF('tblLeaveRegsiter', null, 'LeaveRegisterList', 'Leave Register List', 'l'); // Assuming 11, 12, 13 are the indices of header columns to be hidden

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

  function getMonthName(monthNumber) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthNumber - 1]; // Subtracting 1 to get 0-based index
  }

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

    if (Year === 0 || Year === '') {
      alert("Please Select Year");
      return; // Exit the function if the condition is met
  }

    const postData = {
      "CompanyId": loggedInCompanyId,
      "SessionId": loggedInSessionId,
      "EmployeeId": EmployeeId,
      "Month": selectedMonthValue,
      "Year": Year
    };
    const response = fetch('/LeaveRegister/getLeaveRegister', {
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
          setLeaveRegisterData(data);
  
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
    <Card extra={"w-full h-full p-2"}>
      <div class="relative flex items-center justify-between">
        
        <div class="text-xl font-bold text-navy-700 dark:text-white" style={{ display: "inline-flex", alignItems: "center" }}>
          <MdInsertChartOutlined className="mr-1" style={{ fontSize: '24px', color: "Blue" }} /> {t('Leave Register')}
        </div>
        <CardMenu />
      </div>
      <div className="mt-1 h-half grid-cols-3 gap-3 md:grid-cols-1" >
        <div className="w-half pr-2" style={{ height: "auto", width: "100%", display: "inline-block", padding: "10px", marginRight: "15px", borderColor: "silver", borderWidth: "1px" }}>

          <div className="relative items-center justify-between">
            <div className="mt-1 grid xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-12 lg:grid-cols-12">
              <div className="mt-3 text-sm md:col-span-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
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
                    width: "100%",
                    
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
                <label htmlFor="LeaveName">{t(Year)}</label><label style={{ color: "red" }}>*</label>
              </div>

              <div className="mt-1 text-sm xs:col-span-2 md:col-span-2">
              
              <select
                id="YEAR"
                style={{ border: "solid 1px silver", width: "70%", borderRadius: "5px", padding: "7px" }}
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
              <div className="mt-1 text-sm xs:col-span-2 md:col-span-2">
                  <button className="btn" style={{ marginRight: '4%', padding: '10px 20px', border: '1px solid #ccc', borderRadius: '10px', backgroundColor: 'MediumSeaGreen', color: 'white' }} onClick={handleFilterButtonClick}>
                    {t('Search')}
                  </button>
                </div>
            </div>
          </div>
          
        </div>
        <div className="mt-1 text-sm md:col-span-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
          
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
              table="tblLeaveRegsiter"
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
          <table {...getTableProps()} id ="tblLeaveRegsiter" className="w-full1">
            <thead>
              {headerGroups.map((headerGroup, index) => {
                return (

                  <tr {...headerGroup.getHeaderGroupProps()} key={index} style={{ backgroundColor: "silver", color: "black" ,height: "50px" }}>
                    {headerGroup.headers.map((column, index) => {

                      let data = "";
                      if (column.render("Header") === "Id") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "30px" }}
                          >
                            <p className="text-sm tracking-wide text-gray-600" style={{ color: "black", marginLeft: '10px' }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "100px" }}
                          >
                            <p className="text-sm tracking-wide text-gray-600" style={{ color: "black" }}>
                            {t("Emp. Name")}
                            </p>
                          </th>
                        );
                      } 

                      
                     
                      else if (column.render("Header") === "Month") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "70px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-left" style={{ color: "black" }}>
                              {t("Month")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "01") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "02") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                     
                      else if (column.render("Header") === "03") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "04") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "05") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "06") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "07") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "08") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "09") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "10") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "11") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "12") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "13") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "14") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "15") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "16") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "17") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "18") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "19") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "20") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "21") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "22") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "23") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "24") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "25") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "26") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "27") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "28") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "29") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "30") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "31") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {column.render("Header")}
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
              {LeaveRegisters.map((LeaveRegister, index) => {
                return (
                  <tr key={index} style={{ backgroundColor: index % 2 ? 'whitesmoke' : 'white' }} >
                    {Object.keys(LeaveRegister).map((keyElement, index1) => {
                      let data = "";
                      console.log(keyElement);

                     if(keyElement === "SessionId") {
                      data = (
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-navy-700 dark:text-white text-center" style={{ width: "40px"}}>
                            {index+1}
                          </p>
                        </div>
                      );
                      } 
                     
                     else if (keyElement === "EmployeeName") {
                       data = (
                         <p className="text-sm  text-navy-700 text-left dark:text-white" style={{ width: "100px"}}>
                           {LeaveRegister.EmployeeName} ({LeaveRegister.EmployeeCode})
                         </p>
                       );
                     }
                      
                      else if (keyElement === "MonthYear") {
                        data = (
                          <p className="text-sm  text-navy-700 dark:text-white text-center" style={{ width: "70px"}}>
                            {LeaveRegister.MonthYear}
                          </p>
                        );
                      }

                      else if (keyElement === "Day1") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day1);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day1);
                        
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day1}<br>
                            </br>
                           
                          </p>
                        );
                      }
                      else if (keyElement === "Day2") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day2);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day2);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day2}
                          </p>
                        );
                      }
                      else if (keyElement === "Day3") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day3);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day3);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day3}
                          </p>
                        );
                      }
                     
                      
                      else if (keyElement === "Day4") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day4);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day4);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day4}
                          </p>
                        );
                      }
                      else if (keyElement === "Day5") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day5);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day5);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day5}
                          </p>
                        );
                      }
                      else if (keyElement === "Day6") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day6);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day6);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day6}
                          </p>
                        );
                      }
                      else if (keyElement === "Day7") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day7);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day7);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day7}
                          </p>
                        );
                      }
                      else if (keyElement === "Day8") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day8);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day8);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day8}
                          </p>
                        );
                      }
                      else if (keyElement === "Day9") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day9);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day9);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day9}
                          </p>
                        );
                      }
                      else if (keyElement === "Day10") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day10);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day10);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day10}
                          </p>
                        );
                      }
                      else if (keyElement === "Day11") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day11);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day11);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day11}
                          </p>
                        );
                      }
                      else if (keyElement === "Day12") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day12);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day12);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day12}
                          </p>
                        );
                      }
                      else if (keyElement === "Day13") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day13);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day13);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day13}
                          </p>
                        );
                      }
                      else if (keyElement === "Day14") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day14);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day14);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day14}
                          </p>
                        );
                      }
                      else if (keyElement === "Day15") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day15);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day15);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day15}
                          </p>
                        );
                      }
                      else if (keyElement === "Day16") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day16);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day16);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day16}
                          </p>
                        );
                      }
                      else if (keyElement === "Day17") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day17);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day17);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day17}
                          </p>
                        );
                      }
                      else if (keyElement === "Day18") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day18);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day18);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day17}
                          </p>
                        );
                      }
                      else if (keyElement === "Day19") {
                        data = (
                          <p className="text-sm  text-navy-700 text-center dark:text-white" style={{ width: "40px"}}>
                            {LeaveRegister.Day19}
                          </p>
                        );
                      }
                      else if (keyElement === "Day20") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day20);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day20);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day20}
                          </p>
                        );
                      }
                      else if (keyElement === "Day21") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day21);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day21);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day21}
                          </p>
                        );
                      }
                      else if (keyElement === "Day22") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day22);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day22);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day22}
                          </p>
                        );
                      }
                      else if (keyElement === "Day23") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day23);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day23);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day23}
                          </p>
                        );
                      }
                      else if (keyElement === "Day24") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day24);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day24);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day24}
                          </p>
                        );
                      }
                      else if (keyElement === "Day25") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day25);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day25);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day25}
                          </p>
                        );
                      }
                      else if (keyElement === "Day26") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day26);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day26);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day26}
                          </p>
                        );
                      }
                      else if (keyElement === "Day27") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day27);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day27);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day27}
                          </p>
                        );
                      }
                      else if (keyElement === "Day28") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day28);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day28);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day28}
                          </p>
                        );
                      }
                      else if (keyElement === "Day29") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day29);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day29);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day29}
                          </p>
                        );
                      }
                      else if (keyElement === "Day30") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day30);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day30);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day30}
                          </p>
                        );
                      }
                      else if (keyElement === "Day31") {
                        const leaveTypeColor = getLeaveTypeColor(LeaveRegister.Day31);
                        const leaveTypeTextColor = getLeaveTypeTextColor(LeaveRegister.Day31);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "40px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {LeaveRegister.Day31}
                          </p>
                        );
                      }

                      if (keyElement !== "EmployeeId" && keyElement !== "ManagerId" && keyElement !== "Day1_LeaveType"
                      && keyElement !== "2_LeaveType" && keyElement !== "3_LeaveType" && keyElement !== "4_LeaveType"
                      && keyElement !== "5_LeaveType" && keyElement !== "6_LeaveType" && keyElement !== "7_LeaveType"
                      && keyElement !== "8_LeaveType" && keyElement !== "9_LeaveType" && keyElement !== "10_LeaveType"
                      && keyElement !== "11_LeaveType" && keyElement !== "12_LeaveType" && keyElement !== "13_LeaveType"
                      && keyElement !== "14_LeaveType" && keyElement !== "15_LeaveType" && keyElement !== "16_LeaveType"
                      && keyElement !== "17_LeaveType" && keyElement !== "18_LeaveType" && keyElement !== "19_LeaveType"
                      && keyElement !== "20_LeaveType" && keyElement !== "21_LeaveType" && keyElement !== "22_LeaveType"
                      && keyElement !== "23_LeaveType" && keyElement !== "24_LeaveType" && keyElement !== "25_LeaveType"
                      && keyElement !== "26_LeaveType" && keyElement !== "27_LeaveType" && keyElement !== "28_LeaveType"
                      && keyElement !== "29_LeaveType" && keyElement !== "30_LeaveType" && keyElement !== "31_LeaveType"
                      && keyElement !== "Month" && keyElement !== "Year" && keyElement !== "EmployeeCode"
                      && keyElement !== "Department" && keyElement !== "Designation" && keyElement !== "EmployeeCode"
                      ) {
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
export default LeaveRegister;
