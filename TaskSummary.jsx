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
  MdHistory,
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

  const handleExportToExcelForReAllocated = () => {
    setExportToExcelFlag(1);
  };

  const handleExportToPDFForReAllocated = () => {
    setExportToPDFFlag(1);
  };

  useEffect(() => {
    if (exportToExcelFlag === 1) {
      exportDataToExcel('tblBillSummaryReAllocatedPopup', [8], 'ReAllocatedLIst', [5]); // first array should be coulumn(action) or second Style-color
      setExportToExcelFlag(0);
    }
  }, [exportToExcelFlag]);
  

  useEffect(() => {
    if (exportToPDFFlag === 1) {
      exportDataToPDF('tblBillSummaryReAllocatedPopup', [8], 'ReAllocatedLIst', 'ReAllocated List', 'l'); // Assuming 11, 12, 13 are the indices of header columns to be hidden
      setExportToPDFFlag(0);
    }
  }, [exportToPDFFlag]);

  const [exportToExcelFlagForHistory, setExportToExcelFlagForHistory] = useState(0);
  const [exportToPDFFlagForHistory, setExportToPDFFlagForHistory] = useState(0)

  const handleExportToExcelForHistory = () => {
    setExportToExcelFlagForHistory(1);
  };

  const handleExportToPDFForHistory = () => {
    setExportToPDFFlagForHistory(1);
  };

  useEffect(() => {
    if (exportToExcelFlagForHistory === 1) {
      exportDataToExcel('tblBillSummaryHistoryPopup', [], 'ReAllocatedHistoryLIst', [7]); // first array should be coulumn(action) or second Style-color
      setExportToExcelFlagForHistory(0);
    }
  }, [exportToExcelFlagForHistory]);
  

  useEffect(() => {
    if (exportToPDFFlagForHistory === 1) {
      exportDataToPDF('tblBillSummaryHistoryPopup', [], 'ReAllocatedHistoryLIst', 'ReAllocated History List', 'l'); // Assuming 11, 12, 13 are the indices of header columns to be hidden
      setExportToPDFFlagForHistory(0);
    }
  }, [exportToPDFFlagForHistory]);

  const [exportToExcelFlagForTask, setexportToExcelFlagForTask] = useState(0);
  const [exportToPDFFlagForTask, setexportToPDFFlagForTask] = useState(0)

  const handleExportToExcelForBill = () => {
    setexportToExcelFlagForTask(1);
  };

  const handleExportToPDFForBill = () => {
    setexportToPDFFlagForTask(1);
  };

  useEffect(() => {
    if (exportToExcelFlagForTask === 1) {
      exportDataToExcel('tblBillSummaryTaskPopup', [], 'Task List', [5]); // first array should be coulumn(action) or second Style-color
      setexportToExcelFlagForTask(0);
    }
  }, [exportToExcelFlagForTask]);
  

  useEffect(() => {
    if (exportToPDFFlagForTask === 1) {
      exportDataToPDF('tblBillSummaryTaskPopup', [], 'Task List', 'Task List', 'l'); // Assuming 11, 12, 13 are the indices of header columns to be hidden
      setexportToPDFFlagForTask(0);
    }
  }, [exportToPDFFlagForTask]);
  
//************************* */

  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
  const [Token] = useState(Cookies.get("Token"));

  const [showRecordNotFound, setShowRecordNotFound] = useState('hidden');

  const [TaskSummarys, setTaskSummaryData] = useState([{}]);

  useEffect(() => {
    // setManagerId(loggedInRoleId === "2" ? loggedInEmployeeId : 0);

    handleFilterButtonClick();
    fetchEmployeeName(loggedInCompanyId);

   
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
  const [hoveredIndex, setHoveredIndex] = useState(null);
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

  const [EmployeeFilterValue, setEmployeeFilterValue] = useState(0);
  const [selectedEmployeeFilterRow, setselectedEmployeeFilterRow] = useState({ value: 0, label: "--Select Employee--" });
  
  const [EmployeeNameData, setEmployeeNameData] = useState([]);
  const [EmployeeId, setEmployeeId] = useState(0);
  const selectedOption = { value: 0, label: "--Select Employee--" };
  const [SelectedEmployee, setEmployee] = useState(selectedOption);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Adding 1 since getMonth() returns 0-based index
  const currentYear = currentDate.getFullYear();

  const [startingMonth, setStartingMonth] = useState({ value: currentMonth, label: getMonthName(currentMonth) });
  const [selectedMonthFilterRow, setselectedMonthFilterRow] = useState(null);
  const [Year, setYear] = useState(currentYear);
  const [ToDays, setToDays] = useState(0);

  const [OpenPopupModalFlag, OpenPopupModal] = useState(false);
  const [OpenPopupForReAllocation, setOpenPopupForReAllocation] = useState(false);
  const [TaskSummaryCountData, setTaskSummaryCountData] = useState([{}]);

  const handleCheckboxChange = (event) => {
    setToDays(event.target.checked ? 1 : 0);
  };

  function getMonthName(monthNumber) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthNumber - 1]; // Subtracting 1 to get 0-based index
  }

  // const loggedInRoleId = Cookies.get("LoggedInRoleId");
  // const loggedInEmployeeId = Cookies.get("LoggedInEmployeeId");
  const [loggedInSessionId] = useState(Cookies.get("LoggedInSessionId"));
  const [loggedInCompanyId] = useState(Cookies.get("LoggedInCompanyId"));
  // const [ManagerId, setManagerId] = useState(0);


  const handleCloseButtonClick = () => {
    OpenPopupModal(false)
  };
  const handleCloseButtonForReAllocationPopup = () => {
    setOpenPopupForReAllocation(false)
  };

  const handleEmployeeFilterChange = (event, value) => {
    setEmployee(event);
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
      "Year": Year
      
    };
    const response = fetch('/TaskSummary/getTaskSummary', {
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
          setTaskSummaryData(data);
  
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
  const [TaskCountClickStatus, setTaskCountClickStatus] = useState("");

  useEffect(() => {
    
    }, [TaskCountClickStatus]);

  const handleReallocationPopup = () => {
    const postData = {
      "CompanyId": loggedInCompanyId,
      "Status": '1',
      "ToDays": ToDays,
      "EmployeeId": EmployeeId,
      "Month": selectedMonthValue,
      "Year": Year
      
    };
    const response = fetch('/task/getCountTaskSummaryList', {
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
          setTaskSummaryCountData(data);

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
      setOpenPopupForReAllocation(true);  
  };
  const handlePopupButtonClick = (Status) => {
    setTaskCountClickStatus(Status);
    
    // alert(TaskCountClickStatus);

    // alert(TaskCountClickStatus);
    const postData = {
      "CompanyId": loggedInCompanyId,
      "Status": Status,
      "ToDays": ToDays,
      "EmployeeId": EmployeeId,
      "Month": selectedMonthValue,
      "Year": Year
      
    };
    const response = fetch('/task/getCountTaskSummaryList', {
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
          setTaskSummaryCountData(data);

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
  
  const [OpenHistoryModalFlag, OpenHistoryModal] = useState(false);
  const [HistoryPopupContent, setHistoryPopupContent] = useState('');
  const [TaskAllocationHistoryData, setTaskAllocationHistoryData] = useState([{}]);

  const handleHistoryCloseButtonClick = () => {
    OpenHistoryModal(false)

  };
  const handleReAllocationHistoryButton = (rowData) => {
    const postData = {
      "TaskId": rowData.TaskId
    };
    const response = fetch('/reAllocation/getReAllocationHistoryDetails', {
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
          setTaskAllocationHistoryData(data);

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
    
    const { TaskName, TaskDescription, ProjectName, TaskTypeName, MenuName, SubMenuName, TargetDateFormatted, StatusName,ReallocatedTo,ReAllocatedOn,ReAllocatedRemarks } = rowData;
  
    // Update the popup content with the desired information
    setHistoryPopupContent({ TaskName, TaskDescription, ProjectName, TaskTypeName, MenuName, SubMenuName, TargetDateFormatted, StatusName ,ReallocatedTo,ReAllocatedOn,ReAllocatedRemarks});
    
     // Set the action type

    OpenHistoryModal(true);
 
  }
  const getStatusColor = (status) => {
    // Define background colors for different status values
    const statusColors = {
      Pending: 'Silver',
      Allocated: 'Blue',
      InProgress: 'Yellow',
      CarryForwarded: 'Orange',
      Reallocated: 'Navy',
      Completed: 'lightgreen',
      Cancelled: 'Red',
      AllocatedToQA: 'Blue',
      TestingInProgress: 'Yellow',
      QualityChecked: 'DarkBlue',
      ReleasedOnDevServer:'LightGreen',
      ReleaseOnLiveServer: 'Orange',
      Issue: 'Brown',
      QualityPassed: 'Lime',
      AllocatedForTesting: 'Aqua'

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
      Pending: 'black',
      Allocated: 'white',
      InProgress: 'black',
      CarryForwarded: 'white',
      Reallocated: 'white',
      Completed: 'black',
      Cancelled: 'white',
      AllocatedToQA: 'black',
      TestingInProgress: 'white',
      QualityChecked: 'white',
      ReleasedInLive:'white',
      ReleasedOnDevServer:'Black',
      ReleaseOnLiveServer: 'Black',
      Issue: 'White',
      QualityPassed: 'Black',
      AllocatedForTesting: 'Black'
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
    <Card extra={"w-full h-full p-4"}>
      <div class="relative flex items-center justify-between">
        <div class="text-xl font-bold text-navy-700 dark:text-white" style={{ display: "inline-flex", alignItems: "center" }}>
        <MdTask className="mr-1" style={{ fontSize: '20px', color: "Blue" }} /> {t('Task Summary')}
        </div>
        <CardMenu />
      </div>
      
      <div className="mt-1 h-half grid-cols-3 gap-3 md:grid-cols-1" >
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
        <div className="mt-2 text-sm md:col-span-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
          <div className="mt-1 text-sm xs:col-span-1 md:col-span-1">
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap pr-4 " style={{ height: "auto",  padding: "15px", borderColor: "silver", borderWidth: "1px" }}>
        <div className="md:w-1/6">
            <button className="side-box-container text-center" style={{position: "relative", verticalAlign: "center", width: "95%", height:"155px", padding: "45px",marginRight: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "Silver", fontWeight: "bold"}} onClick={() => handlePopupButtonClick("Total")}>                                           
              <div className="header-box text-center  ">
                <p className="text-sm tracking-wide text-gray-600" style={{ color: "Black", fontSize : "1.8em" }}>
                  {t('Total')}
                </p>
              </div>
              <div className="data-box" style={{color: "Black", fontSize : "1.8em"}}>
                {TaskSummarys[0].Total}
              </div>
          </button>
        </div>
        <div className="md: w-5/6">
          <button className="side-box-container text-center" style={{width: "18%", display: "inline-block", padding: "10px",marginRight: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "Silver"}} onClick={() => handlePopupButtonClick("PND")}>                                           
              <div className="header-box">
                <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "Black" }}>
                  {t('Pending')}
                </button>
              </div>
              <div className="data-box text-center" style={{color: "Black"}}>
                {TaskSummarys[0].Pending}
              </div>
          </button>
          <button className="side-box-container text-center" style={{width: "18%", display: "inline-block", padding: "10px", marginRight: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "Blue"}} onClick={() => handlePopupButtonClick("ALTD")}>
            <div className="header-box">
            <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "White", background: "none", border: "none", cursor: "pointer" }}>
              {t('Allocated')}
            </button>

            </div>
            <div className="data-box text-center" style={{ color: "White" }}>
              {TaskSummarys[0].Allocated}
            </div>
          </button>
          <button className="side-box-container text-center" style={{width: "18%", display: "inline-block", padding: "10px",marginRight: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "Yellow", color: "Black"}} onClick={() => handlePopupButtonClick("IP")}>                                           
            <div className="header-box">
              <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "Black" }} onClick={() => handlePopupButtonClick("IP")}>
                {t('In-Progress')}
              </button>
            </div>
            <div className="data-box text-center" style={{color: "Black"}}>
              {TaskSummarys[0].InProgress}
            </div>
          </button>
          <button className="side-box-container text-center" style={{width: "18%", display: "inline-block", padding: "10px",marginRight: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "Orange"}} onClick={() => handlePopupButtonClick("CF")}>                                           
              <div className="header-box">
                <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "white" }}>
                  {t('Carry Forward')}
                </button>
              </div>
              <div className="data-box text-center" style={{color: "White"}}>
                {TaskSummarys[0].CarryForward}
              </div>
          </button>
          <button className="side-box-container text-center" style={{width: "18%", display: "inline-block", padding: "10px",marginRight: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "LightGreen"}} onClick={() => handlePopupButtonClick("C")}>                                           
              <div className="header-box">
                <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "Black" }}>
                  {t('Completed')}
                </button>
              </div>
              <div className="data-box text-center" style={{color: "Black"}}>
                {TaskSummarys[0].Completed}
              </div>
          </button>

          <div className="mt-4 text-sm md:col-span-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
            
          </div>
          <button className="side-box-container text-center" style={{width: "18%", display: "inline-block", padding: "10px",marginRight: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "red"}} onClick={() => handlePopupButtonClick("CAN")}>                                           
            <div className="header-box">
              <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "White" }}>
              {t('Cancelled')}
              </button>
            </div>
            <div className="data-box text-center" style={{color: "white"}}>
              {TaskSummarys[0].Cancelled}
            </div>
          </button>
          <button className="side-box-container text-center" style={{width: "18%", display: "inline-block", padding: "10px",marginRight: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "LightGreen"}} onClick={() => handlePopupButtonClick("RDS")}>                                           
            <div className="header-box">
              <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "Black" }}>
              {t('Released')}
              </button>
            </div>
            <div className="data-box text-center" style={{color: "Black"}}>
              {TaskSummarys[0].Released}
            </div>
          </button>
          <button className="side-box-container text-center" style={{width: "18%", display: "inline-block", padding: "10px",marginRight: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "Aqua"}} onClick={() => handlePopupButtonClick("ALTDQC")}>                                           
            <div className="header-box">
              <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "Black" }}>
                {t('Allocated QC')}
              </button>
            </div>
            <div className="data-box text-center" style={{color: "Black"}}>
              {TaskSummarys[0].AllocatedQC}
            </div>
          </button>
          <button className="side-box-container text-center" style={{width: "18%", display: "inline-block", padding: "10px",marginRight: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "Brown"}} onClick={() => handlePopupButtonClick("ISS")}>                                           
            <div className="header-box">
              <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "White" }}>
              {t('Issue')}
              </button>
            </div>
            <div className="data-box text-center" style={{color: "white"}}>
              {TaskSummarys[0].Issue}
            </div>
          </button>
          <button className="side-box-container text-center" style={{width: "18%", display: "inline-block", padding: "10px",marginRight: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "Lime"}} onClick={() => handlePopupButtonClick("QCP")}>                                           
            <div className="header-box">
              <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "Black" }}>
              {t('QC Passed')}
              </button>
            </div>
            <div className="data-box text-center" style={{color: "Black"}}>
              {TaskSummarys[0].QCPassed}
            </div>
          </button>
        
          
        </div>  
        
      </div>

      <div className="mt-2 flex flex-wrap pr-4 " style={{ height: "auto",  padding: "15px", borderColor: "silver", borderWidth: "1px" }}>
        
        <div className="md: w-full">

          <div className="text-sm md:col-span-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
            
          </div>

          <button className="side-box-container text-center" style={{width: "18%", display: "inline-block", padding: "10px",marginRight: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "lightblue"}} onClick={() => handleReallocationPopup()}>                                           
            <div className="header-box">
              <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "Black" }} >
                {t('Re-Allocated')}
              </button>
            </div>
            <div className="data-box text-center" style={{color: "Black"}}>
              {TaskSummarys[0].ReAllocated}
            </div>
          </button>
          
          <button className="side-box-container text-center" style={{width: "18%", display: "inline-block", padding: "10px",borderColor: "silver", borderWidth: "1px", backgroundColor: "lime"}} onClick={() => handlePopupButtonClick("OT")}>                                           
              <div className="header-box">
                <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "Black" }}>
                  {t('On-Time')}
                </button>
              </div>
              <div className="data-box text-center" style={{color: "Black"}}>
                {TaskSummarys[0].OnTime}
              </div>
          </button>
          <button className="side-box-container text-center" style={{width: "18%", display: "inline-block", padding: "10px",marginRight: "15px",marginLeft: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "Green", color: "white"}} onClick={() => handlePopupButtonClick("BT")}>                                           
              <div className="header-box">
                <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "White" }}>
                  {t('Before-Time')}
                </button>
              </div>
              <div className="data-box text-center" style={{color: "White"}}>
                {TaskSummarys[0].BeforeTime}
              </div>
          </button>
          
          <button className="side-box-container text-center" style={{width: "18%", display: "inline-block", padding: "10px",marginRight: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "#facc15"}} onClick={() => handlePopupButtonClick("D")}>                                           
              <div className="header-box">
                <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "Black" }}>
                  {t('Delayed')}
                </button>
              </div>
              <div className="data-box text-center" style={{color: "Black"}}>
                {TaskSummarys[0].Delay}
              </div>
          </button>
          <button className="side-box-container text-center" style={{width: "18%", display: "inline-block", padding: "10px",marginRight: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "#b91c1c"}} onClick={() => handlePopupButtonClick("OD")}>                                           
            <div className="header-box">
              <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "White" }}>
                {t('Overdue')}
              </button>
            </div>
            <div className="data-box text-center" style={{color: "White"}}>
              {TaskSummarys[0].Overdue}
            </div>
          </button>
          
          
        </div>  
        
      </div>
      {/* Popup modal start from here */}
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
                overflow:false,
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
          <div className="text-xl dark:text-white" style={{ fontWeight: "bold" }}>{TaskCountClickStatus==='ALTD'? t("Allocated Task"):TaskCountClickStatus==='IP'? t("In-Progress Task"):TaskCountClickStatus==='C'? t("Completed Task"):TaskCountClickStatus==='PND'? t("Pending Task"):TaskCountClickStatus==='CAN'? t("Cancelled Task"):TaskCountClickStatus==='1'? t("Re-Allocated"):TaskCountClickStatus==='OT'? t("On-Time Task"):TaskCountClickStatus==='BT'? t("Before-Time Task"):TaskCountClickStatus==='D'? t("Delayed Task"):TaskCountClickStatus==='OD'? t("Overdue Task"):TaskCountClickStatus==='CF'? t("Carry Forwarded Task"):TaskCountClickStatus==='RDS'? t("Released Task"):TaskCountClickStatus==='ALTDQC'? t("Allocated QC Task"):TaskCountClickStatus==='ISS'? t("Issue Task"):TaskCountClickStatus==='QCP'? t("QC Passed Task"):t("Task")} </div>
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
                    table="tblBillSummaryTaskPopup"
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
            <table id='tblBillSummaryTaskPopup' style={{ width: '100%' }}>
              <thead>
                <tr className="text-sm" style={{ backgroundColor: 'Silver', borderRadius: '6px', width: "100px" }}>
                  <th style={{ padding: '10px 0px' }}>
                    {t('Sr No.')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Task Name')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Task Type')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Project')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Target Date')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Status')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Allocated To')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Allocated Remarks')}
                  </th>
                  
                </tr>
              </thead>
              <tbody style={{ width: '100%' }}>
                {sortData(TaskSummaryCountData).map((CountData, index) => {
                  return (
                    <tr key={index} style={{ backgroundColor: index % 2 ? 'whitesmoke' : 'white' }}>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "50px" }}>{index + 1}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "170px", textAlign: "center" }}>{CountData.TaskName}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "170px", textAlign: "center" }}>{CountData.TaskTypeName}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "220px", textAlign: "center" }}>{CountData.ProjectName}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "140px", textAlign: "center" }}>{CountData.TargetDateFormatted}</td>

                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "140px" }}>
                        <div className={`flex items-center justify-center rounded-full`} style={{ width: '98%', margin: "0 auto", backgroundColor: getStatusColor(CountData.StatusName), height: '2em' }}>
                          <span style={{ color: getStatusTextColor(CountData.StatusName), fontSize: '12px' }}>{CountData.StatusName}</span>
                        </div>
                      </td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "140px", textAlign: "center" }}>{CountData.AllocatedToUserName}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "140px", textAlign: "center" }}>{CountData.AllocatedRemarks}</td>

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
            <button onClick={handleCloseButtonClick} style={{ padding: '10px 20px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: 'Orange', color: 'white' }}>Close</button>
          </div>
        </div>
                
      </Modal>
    {/* Popup modal for ReAllocation start from here */}
      <Modal
            isOpen={OpenPopupForReAllocation}
            onRequestCancel={handleCloseButtonForReAllocationPopup}
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

          <div className="grid grid-cols-2" style={{ fontSize: '18px', fontWeight: "bold", color: 'black', backgroundColor: 'Silver', marginBottom: '5px', padding: '10px', borderRadius: " 10px", overflow: true }}>
          <div className="text-xl dark:text-white" style={{ fontWeight: "bold" }}>{t("Re-Allocated Task")} </div>
            <div className="" style={{ display: 'flex', justifyContent: 'flex-end', }}>
              <button
                onClick={handleCloseButtonForReAllocationPopup}
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
                    table="tblBillSummaryReAllocatedPopup"
                    filename="departmentList"
                    sheet="DepartmentList"
                    buttonText={<><FaFileExcel className="cursor-pointer text-base text-green-500 hover:text-green-700 mr-1" /></>}
                    
                  />
                </div>

                <button onClick={handleExportToExcelForReAllocated} className="text-sm text-slate-400 hover:shadow-md border border-green-400 px-2 rounded-sm">
                  <FaFileExcel className="cursor-pointer text-base text-green-500 hover:text-green-700 mr-1" /> {/* Adjust width, height, and color as needed */}
                </button>

                <button onClick={handleExportToPDFForReAllocated} className="text-sm text-slate-400 hover:shadow-md border border-red-400 px-2 rounded-sm">
                  <FaFilePdf className="cursor-pointer text-base text-red-500 hover:text-red-700 mr-1" /> {/* Adjust width, height, and color as needed */}
                </button>
              </div>
            <CardMenu />
                </div>
          <div className="p-1 overflow-x-scroll sm:overflow-x-auto" style={{ width: '100%', height: "auto",minHeight:"250px",  maxHeight: "500px" }}>
            <table id='tblBillSummaryReAllocatedPopup' style={{ width: '100%' }}>
              <thead>
                <tr className="text-sm" style={{ backgroundColor: 'Silver', borderRadius: '6px', width: "100px" }}>
                  <th style={{ padding: '10px 0px' }}>
                    {t('Sr No.')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Task')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Type')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Project')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Target Date')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Status')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Allocated To')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('ReAllocated To')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Action')}
                  </th>
                  
                </tr>
              </thead>
              <tbody style={{ width: '100%' }}>
                {sortData(TaskSummaryCountData).map((CountData, index) => {
                  return (
                    <tr key={index} style={{ backgroundColor: index % 2 ? 'whitesmoke' : 'white' }}>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "50px" }}>{index + 1}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "150px", textAlign: "center" }}>{CountData.TaskName}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "130px", textAlign: "center" }}>{CountData.TaskTypeName}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "210px", textAlign: "center" }}>{CountData.ProjectName}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "120px", textAlign: "center" }}>{CountData.TargetDateFormatted}</td>

                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "140px" }}>
                        <div className={`flex items-center justify-center rounded-full`} style={{ width: '98%', margin: "0 auto", backgroundColor: getStatusColor(CountData.StatusName), height: '2em' }}>
                          <span style={{ color: getStatusTextColor(CountData.StatusName), fontSize: '12px' }}>{CountData.StatusName}</span>
                        </div>
                      </td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "200px", textAlign: "center" }}>{CountData.PrevAllocatedTo} <br></br> <span style={{fontWeight: 'bold'}}>{("On")}:</span> {CountData.PrevAllocatedOn} <br></br> <span style={{fontWeight: 'bold'}}>{("By")}:</span> {CountData.PrevAllocatedBy}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "200px", textAlign: "center" }}>{CountData.ReallocatedTo} <br></br> <span style={{fontWeight: 'bold'}}>{("On")}:</span> {CountData.ReAllocatedOn} <br></br> <span style={{fontWeight: 'bold'}}>{("By")}:</span> {CountData.ReallocatedBy}</td>
                      
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "30px" }}>
                        <div>
                          <button
                              className="btn btn-edit"
                              onClick={() => handleReAllocationHistoryButton(CountData)} // Set action type to Reject
                            >
                              {hoveredIndex === `delete-${index}` && "close"}
                              {hoveredIndex !== `delete-${index}` && (
                                <MdHistory className="mr-2" style={{ color:'blue'}} />
                              )}
                            </button>
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
            <button onClick={handleCloseButtonForReAllocationPopup} style={{ padding: '10px 20px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: 'Orange', color: 'white' }}>Close</button>

          </div>
        </div>
                
      </Modal>
      <Modal
            isOpen={OpenHistoryModalFlag}
            onRequestCancel={handleHistoryCloseButtonClick}
            contentLabel="Action Modal"
            style={{
              overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex:"9999"
              },
              content: {
                
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '800px', // Adjust the width as needed
                height: '600px',
                padding: '30px',
                boxShadow: '0px 0px 100px rgba(0, 0, 0, 0.1)',
                borderRadius: '10px',
                overflow:false,
              },
            }}
             >
              
            <div>
                <div className="grid grid-cols-2" style={{ fontSize: '18px', fontWeight : "bold", color: 'black', backgroundColor: 'Silver', marginBottom: '20px',marginTop:'-15px', padding: '10px', borderRadius: " 10px" }}>
                  <div className="">
                    {t('History')}
                  </div>
                  <div className="" style={{ display: 'flex', justifyContent: 'flex-end',}}>
                    <button
                      onClick={handleHistoryCloseButtonClick}
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
                  </div>
                </div>

              <div className="border p-1 mb-3" style={{ borderColor: 'black', borderRadius: "10px" , padding:'10px'}}>

                <div className="mt-1 grid h-full gap-5 grid-cols-1">
                  <div>
                    <strong className="text-sm">{t('Task')} :</strong> {HistoryPopupContent.TaskName}
                  </div>  
                </div>

                <div className="mt-2 grid h-full gap-5 grid-cols-1">
                  <div>
                    <strong className="text-sm">{t('Description')} :</strong> {HistoryPopupContent.TaskDescription}
                  </div>
                </div>

                <div className="mt-2 grid h-full gap-5 grid-cols-2">
                  <div>
                    <strong className="text-sm">{t('Project')} :</strong> {HistoryPopupContent.ProjectName }
                  </div>
                  <div>
                    <strong className="text-sm">{t('Task Type')} :</strong> {HistoryPopupContent.TaskTypeName }
                  </div>
                </div>
                <div className="mt-2 grid h-full gap-5 grid-cols-2">
                    <div>
                    <span className="text-sm" style={{fontWeight:"bold"}}>{t('Status')} : </span>
                    <span className={`text-sm flex items-center text-center rounded-full`} style={{ backgroundColor: (HistoryPopupContent.StatusName), color: (HistoryPopupContent.StatusName), height: '2em', width: "100px", display: "inline-block", paddingTop: "3px" }} >{HistoryPopupContent.StatusName}</span>
                    </div>                       
                      <div>
                    <strong className="text-sm">{t('Target Date')} : </strong> {HistoryPopupContent.TargetDateFormatted }
                    </div>
                </div>
                <div className="mt-2 grid h-full gap-5 grid-cols-2">
                    <div>
                      <strong className="text-sm">{t('Allocated To')} : </strong> {HistoryPopupContent.ReallocatedTo }
                    </div>   
                      <div>
                    <strong className="text-sm">{t('Allocated On')} : </strong> {HistoryPopupContent.ReAllocatedOn }
                    </div>
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
                    table="tblBillSummaryHistoryPopup"
                    filename="departmentList"
                    sheet="DepartmentList"
                    buttonText={<><FaFileExcel className="cursor-pointer text-base text-green-500 hover:text-green-700 mr-1" /></>}
                    
                  />
                </div>

                <button onClick={handleExportToExcelForHistory} className="text-sm text-slate-400 hover:shadow-md border border-green-400 px-2 rounded-sm">
                  <FaFileExcel className="cursor-pointer text-base text-green-500 hover:text-green-700 mr-1" /> {/* Adjust width, height, and color as needed */}
                </button>

                <button onClick={handleExportToPDFForHistory} className="text-sm text-slate-400 hover:shadow-md border border-red-400 px-2 rounded-sm">
                  <FaFilePdf className="cursor-pointer text-base text-red-500 hover:text-red-700 mr-1" /> {/* Adjust width, height, and color as needed */}
                </button>
              </div>
            <CardMenu />
                </div>
        <div className="p-1 overflow-x-scroll sm:overflow-x-auto" style={{ width: '100%', height: "220px" }}>
          <table id='tblBillSummaryHistoryPopup' style={{ width: '100%' }}>
            <thead>
              <tr className="text-sm" style={{ backgroundColor: 'Silver', borderRadius: '6px' }}>
                <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                  {t('Sr. No.')} 
                </th>
                <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                  {t('ReAllocated To')} 
                </th>
                <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                  {t('ReAllocated On')} 
                </th>
                <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                   {t('ReAllocated Remarks')} 
                </th>
              </tr>
            </thead>
              <tbody style={{ width: '100%' }}>
                {TaskAllocationHistoryData.map((TaskAllocationHistoryData, index) => {
                return (
                  <tr key={index} style={{ backgroundColor: index % 2 ? 'smokewhite' : 'white' }}>
                    <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "50px" }}>{index + 1}</td>
                    <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "280px", textAlign: "center" }}>{TaskAllocationHistoryData.PreAllocatedTo}</td>
                    <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "200px", textAlign: "center" }}>{TaskAllocationHistoryData.PreAllocatedOn}</td>
                    <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "230px" }}>{TaskAllocationHistoryData.PreAllocatedRemarks}</td>
                  </tr>
                );
              })}
              <tr style={{ visibility: showRecordNotFound }}>
                <td className="text-center" colSpan="15" style={{ color: "red" }}>{t('No Record Found')}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ bottom: '10px', textAlign: "center" }}>
          <button onClick={handleHistoryCloseButtonClick} style={{ padding: '10px 20px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: 'Firebrick', color: 'white', marginTop: '5px', marginBottom: '5px' }}>{t('Close')}</button>
        </div>
            </div>
             
      </Modal>

          </Card>
  );
};

export default TaskSummary;
