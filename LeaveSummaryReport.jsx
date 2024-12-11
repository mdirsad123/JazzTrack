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
import { MdNoteAlt } from "react-icons/md";
import { useTranslation } from 'react-i18next'; //By Md Irsad - 30-August-2024 (For Globalization)

import { exportDataToExcel, exportDataToPDF } from 'components/ExportUtils/ExportUtils';
import { FaFileExcel, FaFilePdf, FaListAlt } from "react-icons/fa"
import ReactHTMLTableToExcel from 'react-html-table-to-excel';

const LeaveSummaryReport = (props) => {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
  const [Token] = useState(Cookies.get("Token"));

  const [showRecordNotFound, setShowRecordNotFound] = useState('hidden');

  const [LeaveSummaryReports, setLeaveSummaryReportData] = useState([{}]);

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
        exportDataToExcel('tblLeaveSummary', null, 'LeaveSummaryList', [5,7,8]); // first array should be coulumn(action) or second Style-color

        setExportToExcelFlag(0);
      }
    }, [exportToExcelFlag]);
    
  
    useEffect(() => {
      if (exportToPDFFlag === 1) {
        exportDataToPDF('tblLeaveSummary', null, 'LeaveSummaryList', 'Leave Summary List', 'p'); // Assuming 11, 12, 13 are the indices of header columns to be hidden

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
    const response = fetch('/LeaveSummaryReport/getLeaveSummaryReport', {
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
          setLeaveSummaryReportData(data);
  
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
            <MdNoteAlt className="mr-1" style={{ fontSize: '24px', color: "Blue" }} /> {t('Leave summary')}
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
                    width: "130%",
                    marginLeft: "20px"
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
            <div className="mt-3 text-sm md:col-span-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2" style={{ marginLeft: "55px"}}>
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
                    width: "90%",
                    marginLeft: "60px"
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
            <div className="mt-3 text-sm md:col-span-1  xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2" style={{ marginLeft: "55px"}}>
              <label htmlFor="LeaveName">{t('Year')}</label><label style={{ color: "red" }}>*</label>
            </div>
            <div className="mt-1 text-sm xs:col-span-2 md:col-span-2">
              <select
                id="YEAR"
                style={{ border: "solid 1px silver", width: "90%",height: "100%", borderRadius: "5px", padding: "7px", marginLeft: "55px" }}
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
              <button className="btn" style={{ marginLeft: '55px', padding: '8px 10px', border: '1px solid #ccc', borderRadius: '10px', backgroundColor: 'MediumSeaGreen', color: 'white' }} onClick={handleFilterButtonClick}>
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
              table="tblLeaveSummary"
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
      <div className="overflow-scroll sm:overflow-auto" style={{ height: "175px"}}>
          <table {...getTableProps()} id ="tblLeaveSummary" className="w-full1">
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "80px" }}
                          >
                            <p className="text-sm tracking-wide text-gray-600" style={{ color: "black" }}>
                            {t("Emp. Name")}
                            </p>
                          </th>
                        );
                      } 

                      if (column.render("Header") === "Month Year") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "60px" }}
                          >
                            <p className="text-sm tracking-wide text-gray-600 text-left" style={{ color: "black"}}>
                            {t('Month')}
                            </p>
                          </th>
                        );
                      } 

                      else if (column.render("Header") === "CL") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {t("CL")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "PL") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center " style={{ color: "black" }}>
                              {t("PL")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "SL") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {t("SL")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "CO") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {t("CO")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "ML") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "50px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {t("ML")}
                            </p>
                          </th>
                        );
                      }
                     
                      else if (column.render("Header") === "TOTAL") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "70px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {t("TOTAL")}
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
              {LeaveSummaryReports.map((LeaveSummaryReport, index) => {
                return (
                  <tr key={index} style={{ backgroundColor: index % 2 ? 'whitesmoke' : 'white' }} >
                    {Object.keys(LeaveSummaryReport).map((keyElement, index1) => {
                      let data = "";

                     if(keyElement === "SessionId") {
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
                          <p className="text-sm  text-navy-700 text-left dark:text-white" style={{ width: "100px"}}>
                            {LeaveSummaryReport.EmployeeName} ({LeaveSummaryReport.EmployeeCode})
                          </p>
                        );
                      }
                     else if (keyElement === "MonthYear") {
                       data = (
                         <p className="text-sm  text-navy-700 text-center dark:text-white" style={{ width: "70px" }}>
                           {LeaveSummaryReport.MonthYear}
                         </p>
                       );
                     }
                      else if (keyElement === "CL") {
                        data = (
                          <p className="text-sm  text-navy-700 text-center dark:text-white" style={{ width: "50px", backgroundColor: "LightBlue", color: "Black"}}>
                            {LeaveSummaryReport.CL}
                          </p>
                        );
                      }

                      else if (keyElement === "PL") {
                        data = (
                          <p className="text-sm  text-navy-700 dark:text-white text-center" style={{ width: "50px", backgroundColor: "Lime", color: "Black"}}>
                            {LeaveSummaryReport.PL}
                          </p>
                        );
                      }

                      else if (keyElement === "SL") {
                        data = (
                          <p className="text-sm  text-navy-700  dark:text-white text-center" style={{ width: "50px", backgroundColor: "orange", color: "White"}}>
                            {LeaveSummaryReport.SL}
                          </p>
                        );
                      }
                      else if (keyElement === "CO") {
                        data = (
                          <p className="text-sm  text-navy-700 text-center dark:text-white" style={{ width: "50px" , backgroundColor: "Yellow", color: "Black"}}>
                            {LeaveSummaryReport.CO}
                          </p>
                        );
                      }
                      else if (keyElement === "ML") {
                        data = (
                          <p className="text-sm  text-navy-700 text-center dark:text-white" style={{ width: "50px" , backgroundColor: "Green", color: "White"}}>
                            {LeaveSummaryReport.ML}
                          </p>
                        );
                      }
                     
                      else if (keyElement === "TOTAL") {
                        data = (
                          <p className="text-sm  text-navy-700 text-center dark:text-white" style={{ width: "70px", fontWeight: "bold" , backgroundColor: "Blue", color: "White"}}>
                            {LeaveSummaryReport.TOTAL}
                          </p>
                        );
                      }

                      if (keyElement !== "EmployeeId" && keyElement !== "EmployeeCode") {
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
export default LeaveSummaryReport;
