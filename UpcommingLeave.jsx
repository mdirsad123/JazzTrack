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
import { FcLeave } from "react-icons/fc";
import { useTranslation } from 'react-i18next'; //By Md Irsad - 30-August-2024 (For Globalization)
import { exportDataToExcel, exportDataToPDF } from 'components/ExportUtils/ExportUtils';
import { FaFileExcel, FaFilePdf, FaListAlt } from "react-icons/fa"
import ReactHTMLTableToExcel from 'react-html-table-to-excel';

const getLeaveTypeColor = (status) => {
  // Define colors for different status values
  const statusColors = {
    HD: '#feb236',
    FD: '#ff7b25',
    QD: 'yellow'
    
    // Add more status-color mappings as needed
  };

  if (status === undefined){
    status = "";
  }
  var trimmedStatus = status.replace(' ', '');
  trimmedStatus = trimmedStatus.replace('-', '');
  
  // Use the color for the corresponding status, or a default color if not found
  return statusColors[trimmedStatus] || 'Gray'; // Default color is gray
};

const getLeaveTypeTextColor = (status) => {
  // Define colors for different status values
  const statusColors = {
    HD: 'Black',
    FD: 'White',
    QD: 'Black'
    
    // Add more status-color mappings as needed
  };

  if (status === undefined) {
    status = "";
  }
  
  var trimmedStatus = status.replace(' ', '');
  trimmedStatus = trimmedStatus.replace('-', '');

  // Use the color for the corresponding status, or a default color if not found
  return statusColors[trimmedStatus] || 'Black'; // Default color is gray
};

const getLeaveCodeColor = (status) => {
  // Define colors for different status values
  const statusColors = {
    CL: 'LightBlue',
    PL: 'Lime',
    SL: 'orange',
    ML: 'Green',
    CO: 'Yellow'
    
    // Add more status-color mappings as needed
  };

  if (status === undefined){
    status = "";
  }
  var trimmedStatus = status.replace(' ', '');
  trimmedStatus = trimmedStatus.replace('-', '');
  
  // Use the color for the corresponding status, or a default color if not found
  return statusColors[trimmedStatus] || 'Gray'; // Default color is gray
};

const getLeaveCodeTextColor = (status) => {
  // Define colors for different status values
  const statusColors = {
    CL: 'black',
    PL: 'black',
    SL: 'white',
    ML: 'white',
    CO: 'black'
    
    // Add more status-color mappings as needed
  };

  if (status === undefined) {
    status = "";
  }
  
  var trimmedStatus = status.replace(' ', '');
  trimmedStatus = trimmedStatus.replace('-', '');

  // Use the color for the corresponding status, or a default color if not found
  return statusColors[trimmedStatus] || 'Black'; // Default color is gray
};


const UpcomingLeave = (props) => {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
  const [Token] = useState(Cookies.get("Token"));

  const [showRecordNotFound, setShowRecordNotFound] = useState('hidden');

  const [UpcomingLeaves, setUpcomingLeaveData] = useState([{}]);

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
        exportDataToExcel('tblUpcommingLeave', null, 'UpcommingLevaeList', [3,4]); // first array should be coulumn(action) or second Style-color

        setExportToExcelFlag(0);
      }
    }, [exportToExcelFlag]);
    
  
    useEffect(() => {
      if (exportToPDFFlag === 1) {
        exportDataToPDF('tblUpcommingLeave', null, 'UpcommingLevaeList', 'Upcomming Levae List', 'l'); // Assuming 11, 12, 13 are the indices of header columns to be hidden

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
  const [loggedInRoleId] = useState(Cookies.get("LoggedInRoleId"));
  const [loggedInEmployeeId] = useState(Cookies.get("LoggedInEmployeeId"));

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
    const response = fetch('/UpcomingLeave/getUpcomingLeave', {
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
          setUpcomingLeaveData(data);
  
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
          <FcLeave className="mr-1" style={{ fontSize: '24px', color: "Blue" }} /> {t('Upcoming Leaves')}
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
        <div className="mt-2 text-sm md:col-span-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
          
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
              table="tblUpcommingLeave"
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
      <div className="mt-3 h-full" style={{ paddingRight: "2px", width: "100%",marginLeft:'3px' }}>
        <div className="overflow-x-scroll sm:overflow-x-auto">
          <table {...getTableProps()} id ="tblUpcommingLeave" className="w-full1">
            <thead>
              {headerGroups.map((headerGroup, index) => {
                return (

                  <tr {...headerGroup.getHeaderGroupProps()} key={index} style={{ backgroundColor: "silver", color: "black" ,height: "50px" }}>
                    {headerGroup.headers.map((column, index) => {

                      let data = "";
                      if (column.render("Header") === "Sr.No") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "80px" }}
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "120px" }}
                          >
                            <p className="text-sm tracking-wide text-gray-600" style={{ color: "black"}}>
                            {t("Emp. Name")}
                            </p>
                          </th>
                        );
                      } 

                      if (column.render("Header") === "Date") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "180px" }}
                          >
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black"}}>
                            {t("Date")}
                            </p>
                          </th>
                        );
                      } 

                      else if (column.render("Header") === "Leave Code") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "100px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "black" }}>
                              {t("Leave Code")}
                            </p>
                          </th>
                        );
                      }
                      else if (column.render("Header") === "Leave Type") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "100px" }}>
                            <p className="text-sm tracking-wide text-gray-600 text-center " style={{ color: "black" }}>
                              {t('Type')}
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
              {UpcomingLeaves.map((UpcomingLeave, index) => {
                return (
                  <tr key={index} style={{ backgroundColor: index % 2 ? 'whitesmoke' : 'white' }} >
                    {Object.keys(UpcomingLeave).map((keyElement, index1) => {
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
                            {UpcomingLeave.EmployeeName} ({UpcomingLeave.EmployeeCode})
                          </p>
                        );
                      }
                     else if (keyElement === "FromDate") {
                       data = (
                         <p className="text-sm  text-navy-700 text-center dark:text-white" style={{ width: "200px" }}>
                           {UpcomingLeave.FromDate} <span>To</span> {UpcomingLeave.ToDate}
                         </p>
                       );
                     }
                      else if (keyElement === "LeaveCode") {
                        const leaveCodeColor = getLeaveCodeColor(UpcomingLeave.LeaveCode);
                        const leaveCodeTextColor = getLeaveCodeTextColor(UpcomingLeave.LeaveCode);
                        data = (
                          <p className="text-sm  text-navy-700 dark:text-white text-center" style={{ width: "60px", backgroundColor: leaveCodeColor, color: leaveCodeTextColor}}>
                            {UpcomingLeave.LeaveCode}
                          </p>
                        );
                      }

                      else if (keyElement === "LeaveType") {
                        const leaveTypeColor = getLeaveTypeColor(UpcomingLeave.LeaveType);
                        const leaveTypeTextColor = getLeaveTypeTextColor(UpcomingLeave.LeaveType);
                        data = (
                          <p className="text-sm  text-navy-700 dark:text-white text-center" style={{ width: "60px", backgroundColor: leaveTypeColor, color: leaveTypeTextColor}}>
                            {UpcomingLeave.LeaveType}
                          </p>
                        );
                      }

                      
                      if (keyElement !== "EmployeeId" && keyElement !== "ToDate"
                      && keyElement !== "EmployeeCode") {
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
export default UpcomingLeave;
