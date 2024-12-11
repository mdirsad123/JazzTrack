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
import { MdAssignmentTurnedIn } from "react-icons/md";
import { useTranslation } from 'react-i18next'; //By Md Irsad - 30-August-2024 (For Globalization)
import { exportDataToExcel, exportDataToPDF } from 'components/ExportUtils/ExportUtils';
import { FaFileExcel, FaFilePdf, FaListAlt } from "react-icons/fa"
import ReactHTMLTableToExcel from 'react-html-table-to-excel';

const getStatusColor = (status) => {
  // Define colors for different status values
  const statusColors = {
    P: 'lightblue',
    A: 'Red',
    L: 'yellow',
    W: 'lightgreen',
    LWP: 'Orange',
    H: 'Green',
    HHP: 'violet',
    HHA: 'brown'
    
    // Add more status-color mappings as needed
  };

  if (status === undefined){
    status = "";
  }
  var trimmedStatus = status.replace(' ', '');
  trimmedStatus = trimmedStatus.replace('-', '');
  
  // Use the color for the corresponding status, or a default color if not found
  return statusColors[trimmedStatus] || 'lightGray'; // Default color is gray
};
const getStatusTextColor = (status) => {
  // Define colors for different status values
  const statusColors = {
    A: 'White',
    P: 'Black',
    L: 'Black',
    W: 'Black',
    LWP: 'White',
    H: 'White',
    HHP: 'Black',
    HHA: 'White'
  };

  if (status === undefined) {
    status = "";
  }
  
  var trimmedStatus = status.replace(' ', '');
  trimmedStatus = trimmedStatus.replace('-', '');

  // Use the color for the corresponding status, or a default color if not found
  return statusColors[trimmedStatus] || 'Black'; // Default color is gray
};


const AttendanceRegister = (props) => {

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

  const [AttendanceRegisters, setAttendanceRegisterData] = useState([{}]);

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
      exportDataToExcel('tblAttendanceRegister', null, 'AttendanceRegisterList', [4,6,8,9,10,11,12,13,14,15,16,17,18,20,21,22,23,26,27,28,29,30,31,34]); // first array should be coulumn(action) or second Style-color

      setExportToExcelFlag(0);
    }
  }, [exportToExcelFlag]);
  

  useEffect(() => {
    if (exportToPDFFlag === 1) {
      exportDataToPDF('tblAttendanceRegister', null, 'AttendanceRegisterList', 'Attendance Register List', 'l'); // Assuming 11, 12, 13 are the indices of header columns to be hidden

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
      "Sessionid": loggedInSessionId,
      "EmployeeId": EmployeeId,
      "Month": selectedMonthValue,
      "Year": Year
    };
    const response = fetch('/AttendanceRegister/getAttendanceRegister', {
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
          setAttendanceRegisterData(data);
  
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
    <Card extra={"w-full h-full p-3"}>
      <div class="relative flex items-center justify-between pt-2">
        <div class="text-xl font-bold text-navy-700 dark:text-white" style={{ display: "inline-flex", alignItems: "center" }}>
          <MdAssignmentTurnedIn className="mr-1" style={{ fontSize: '24px', color: "Blue" }} /> {t('Attendance Register')}
        </div>
        <CardMenu />
      </div>
      <div className="mt-1 h-half grid-cols-3 gap-3 md:grid-cols-1" >
        <div className="w-half pr-4" style={{ height: "auto", width: "100%", display: "inline-block", padding: "10px", marginRight: "15px", borderColor: "silver", borderWidth: "1px" }}>

          <div className="relative items-center justify-between">
            <div className="mt-1 grid xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-12 lg:grid-cols-12">
              <div className="mt-3 text-sm md:col-span-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
                <label htmlFor="ProjectName">{t('Employee')}</label>
              </div>
              <div className="mt-1 text-sm xs:col-span-3 md:col-span-3">

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
        {/* <u style={{fontWeight:"bold"}}>Attendance Regsiter List</u> */}
      </div>
      <div className="flex space-x-2" style={{ paddingRight: "2.5%" }}>
          
          <div className="text-sm text-slate-400 hover:shadow-md border border-green-400 p-1 px-2 rounded-sm text-center item-center" 
          style={{width:"40px", padding: '7px 5px', visibility:"collapse" }}>
            <ReactHTMLTableToExcel
              id="test-table-xls-button"
              table="tblAttendanceRegister"
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
          <table {...getTableProps()} id ="tblAttendanceRegister" className="w-full1">
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "40px" }}
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-left" style={{ color: "black", marginLeft: "5px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black", marginRight: "20px"}}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px"}}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black",marginRight: "20px" }}>
                              {column.render("Header")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "Paid Days") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "80px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {t("Paid Days")}
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
              {AttendanceRegisters.map((AttendanceRegister, index) => {
                return (
                  <tr key={index} style={{ backgroundColor: index % 2 ? 'whitesmoke' : 'white' }} >
                    {Object.keys(AttendanceRegister).map((keyElement, index1) => {
                      let data = "";
                      

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
                           {AttendanceRegister.EmployeeName} ({AttendanceRegister.EmployeeCode})
                         </p>
                       );
                     }
                     

                     
                      else if (keyElement === "MonthYear") {
                        data = (
                          <p className="text-sm  text-navy-700 dark:text-white text-center" style={{ width: "110px", marginLeft: "-20px"}}>
                            {AttendanceRegister.MonthYear}
                          </p>
                        );
                      }

                      else if (keyElement === "Day1") {
                        const statusColor = getStatusColor(AttendanceRegister.Day1);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day1);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day1}
                          </p>
                        );
                      }
                      else if (keyElement === "Day2") {
                        const statusColor = getStatusColor(AttendanceRegister.Day2);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day2);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day2}
                          </p>
                        );
                      }
                      else if (keyElement === "Day3") {
                        const statusColor = getStatusColor(AttendanceRegister.Day3);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day3);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day3}
                          </p>
                        );
                      }
                     
                      
                      else if (keyElement === "Day4") {
                        const statusColor = getStatusColor(AttendanceRegister.Day4);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day4);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day4}
                          </p>
                        );
                      }
                      else if (keyElement === "Day5") {
                        const statusColor = getStatusColor(AttendanceRegister.Day5);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day5);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day5}
                          </p>
                        );
                      }
                      else if (keyElement === "Day6") {
                        const statusColor = getStatusColor(AttendanceRegister.Day6);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day6);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day6}
                          </p>
                        );
                      }
                      else if (keyElement === "Day7") {
                        const statusColor = getStatusColor(AttendanceRegister.Day7);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day7);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day7}
                          </p>
                        );
                      }
                      else if (keyElement === "Day8") {
                        const statusColor = getStatusColor(AttendanceRegister.Day8);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day8);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day8}
                          </p>
                        );
                      }
                      else if (keyElement === "Day9") {
                        const statusColor = getStatusColor(AttendanceRegister.Day9);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day9);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day9}
                          </p>
                        );
                      }
                      else if (keyElement === "Day10") {
                        const statusColor = getStatusColor(AttendanceRegister.Day10);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day10);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day10}
                          </p>
                        );
                      }
                      else if (keyElement === "Day11") {
                        const statusColor = getStatusColor(AttendanceRegister.Day11);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day11);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day11}
                          </p>
                        );
                      }
                      else if (keyElement === "Day12") {
                        const statusColor = getStatusColor(AttendanceRegister.Day12);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day12);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day12}
                          </p>
                        );
                      }
                      else if (keyElement === "Day13") {
                        const statusColor = getStatusColor(AttendanceRegister.Day13);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day13);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day13}
                          </p>
                        );
                      }
                      else if (keyElement === "Day14") {
                        const statusColor = getStatusColor(AttendanceRegister.Day14);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day14);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day14}
                          </p>
                        );
                      }
                      else if (keyElement === "Day15") {
                        const statusColor = getStatusColor(AttendanceRegister.Day15);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day15);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day15}
                          </p>
                        );
                      }
                      else if (keyElement === "Day16") {
                        const statusColor = getStatusColor(AttendanceRegister.Day16);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day16);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day16}
                          </p>
                        );
                      }
                      else if (keyElement === "Day17") {
                        const statusColor = getStatusColor(AttendanceRegister.Day17);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day17);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day17}
                          </p>
                        );
                      }
                      else if (keyElement === "Day18") {
                        const statusColor = getStatusColor(AttendanceRegister.Day18);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day18);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day18}
                          </p>
                        );
                      }
                      else if (keyElement === "Day19") {
                        const statusColor = getStatusColor(AttendanceRegister.Day19);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day19);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day19}
                          </p>
                        );
                      }
                      else if (keyElement === "Day20") {
                        const statusColor = getStatusColor(AttendanceRegister.Day20);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day20);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day20}
                          </p>
                        );
                      }
                      else if (keyElement === "Day21") {
                        const statusColor = getStatusColor(AttendanceRegister.Day21);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day21);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day21}
                          </p>
                        );
                      }
                      else if (keyElement === "Day22") {
                        const statusColor = getStatusColor(AttendanceRegister.Day22);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day22);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day22}
                          </p>
                        );
                      }
                      else if (keyElement === "Day23") {
                        const statusColor = getStatusColor(AttendanceRegister.Day23);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day23);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day23}
                          </p>
                        );
                      }
                      else if (keyElement === "Day24") {
                        const statusColor = getStatusColor(AttendanceRegister.Day24);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day24);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day24}
                          </p>
                        );
                      }
                      else if (keyElement === "Day25") {
                        const statusColor = getStatusColor(AttendanceRegister.Day25);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day25);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day25}
                          </p>
                        );
                      }
                      else if (keyElement === "Day26") {
                        const statusColor = getStatusColor(AttendanceRegister.Day26);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day26);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day26}
                          </p>
                        );
                      }
                      else if (keyElement === "Day27") {
                        const statusColor = getStatusColor(AttendanceRegister.Day27);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day27);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day27}
                          </p>
                        );
                      }
                      else if (keyElement === "Day28") {
                        const statusColor = getStatusColor(AttendanceRegister.Day28);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day28);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day28}
                          </p>
                        );
                      }
                      else if (keyElement === "Day29") {
                        const statusColor = getStatusColor(AttendanceRegister.Day29);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day29);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day29}
                          </p>
                        );
                      }
                      else if (keyElement === "Day30") {
                        const statusColor = getStatusColor(AttendanceRegister.Day30);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day30);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day30}
                          </p>
                        );
                      }
                      else if (keyElement === "Day31") {
                        const statusColor = getStatusColor(AttendanceRegister.Day31);
                        const statusTextColor = getStatusTextColor(AttendanceRegister.Day31);
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "30px", backgroundColor: statusColor, color: statusTextColor}}>
                            {AttendanceRegister.Day31}
                          </p>
                        );
                      }
                      else if (keyElement === "PaidDays") {
                        data = (
                          <p className="text-sm  text-navy-700 text-center dark:text-white" style={{ width: "80px", fontWeight: "bold", backgroundColor: "blueviolet", color: "White"}}>
                            {AttendanceRegister.PaidDays}
                          </p>
                        );
                      }

                      if (keyElement !== "EmployeeId" && keyElement !== "ManagerId" 
                      && keyElement !== "Month" && keyElement !== "Year"
                      && keyElement !== "Department" && keyElement !== "Designation"
                      && keyElement !== "EmployeeCode"
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
export default AttendanceRegister;
