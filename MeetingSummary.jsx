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
import { FaFileExcel, FaFilePdf} from "react-icons/fa"
import {
  MdTask,
  MdEmail,
  MdHistory
} from "react-icons/md";
import { useTranslation } from 'react-i18next'; //By Md Irsad - 30-August-2024 (For Globalization)
import { exportDataToExcel, exportDataToPDF } from 'components/ExportUtils/ExportUtils';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';

const TaskSummary = (props) => {

  const [MeetingSummaryCountData, setMeetingSummaryCountData] = useState([]);
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
  const [Token] = useState(Cookies.get("Token"));

  const [showRecordNotFound, setShowRecordNotFound] = useState('hidden');
  const [MeetingSummarys, setMeetingSummaryData] = useState([{}]);

  useEffect(() => {
    // setManagerId(loggedInRoleId === "2" ? loggedInCustomerId : 0);

    handleFilterButtonClick();
    fetchCustomerOptions();
    fetchProjectOptions();
   
    }, []);

  const [exportToExcelFlag, setExportToExcelFlag] = useState(0);
  const [exportToPDFFlag, setExportToPDFFlag] = useState(0)

  const handleExportToExcel = () => {
    setPageSize(100);
    setExportToExcelFlag(1);
  };

  const handleExportToPDF = () => {
    setPageSize(100);
    setExportToPDFFlag(1);
  };

  useEffect(() => {

    if (MeetingCountClickStatus === 'Total')
  {
      if (exportToExcelFlag === 1) {
        exportDataToExcel('tblMeetingDashboardExcelToPdf', [6], 'AllMeetingList', [5]); // first array should be coulumn(action) or second Style-color
        setPageSize(5);
        setExportToExcelFlag(0);
      }
      }

    if (MeetingCountClickStatus==="RESCH"){
    if (exportToExcelFlag === 1) {
      exportDataToExcel('tblMeetingDashboardExcelToPdf', [7], 'RescheduledMeetingList', [6]); // first array should be coulumn(action) or second Style-color
      setPageSize(5);
      setExportToExcelFlag(0);
    }
  }

    if (MeetingCountClickStatus === "CAN") {
      if (exportToExcelFlag === 1) {
        exportDataToExcel('tblMeetingDashboardExcelToPdf', [7], 'RescheduledMeetingList', [6]); // first array should be coulumn(action) or second Style-color

        setPageSize(5);
        setExportToExcelFlag(0);
      }
    }

    if (MeetingCountClickStatus === "SCH") {
      if (exportToExcelFlag === 1) {
        exportDataToExcel('tblMeetingDashboardExcelToPdf', [6], 'ScheduledMeetingList', [5]); // first array should be coulumn(action) or second Style-color

        setPageSize(5);
        setExportToExcelFlag(0);
      }
    }
    if (MeetingCountClickStatus === "C") {
      if (exportToExcelFlag === 1) {
        exportDataToExcel('tblMeetingDashboardExcelToPdf', [6], 'CompletedMeetingList', [5]); // first array should be coulumn(action) or second Style-color

        setPageSize(5);
        setExportToExcelFlag(0);
      }
    }
    if (MeetingCountClickStatus === "IG") {
      if (exportToExcelFlag === 1) {
        exportDataToExcel('tblMeetingDashboardExcelToPdf', [6], 'InvoiceGeneratedMeetingList', [5]); // first array should be coulumn(action) or second Style-color

        setPageSize(5);
        setExportToExcelFlag(0);
      }
    }


  }, [exportToExcelFlag]);

  useEffect(() => {

    if (MeetingCountClickStatus === "Total") {
      if (exportToPDFFlag === 1) {
        exportDataToPDF('tblMeetingDashboardExcelToPdf', [6], 'AllMeetingList', 'All Meeting List', 'l'); // Assuming 11, 12, 13 are the indices of header columns to be hidden

        setPageSize(5);
        setExportToPDFFlag(0);
      }
    }

    if (MeetingCountClickStatus === "RESCH") {
    if (exportToPDFFlag === 1) {
      exportDataToPDF('tblMeetingDashboardExcelToPdf', [7], 'RescheduledMeetingList', 'Rescheduled Meeting List', 'l'); // Assuming 11, 12, 13 are the indices of header columns to be hidden

      setPageSize(5);
      setExportToPDFFlag(0);
    }
  }

    if (MeetingCountClickStatus === "CAN") {
      if (exportToPDFFlag === 1) {
        exportDataToPDF('tblMeetingDashboardExcelToPdf', [7], 'CancelledMeetingList', 'Cancelled Meeting List', 'l'); // Assuming 11, 12, 13 are the indices of header columns to be hidden

        setPageSize(5);
        setExportToPDFFlag(0);
      }
    }
    if (MeetingCountClickStatus === "SCH") {
      if (exportToPDFFlag === 1) {
        exportDataToPDF('tblMeetingDashboardExcelToPdf', [6], 'ScheduledMeetingList', 'Scheduled Meeting List', 'l'); // Assuming 11, 12, 13 are the indices of header columns to be hidden

        setPageSize(5);
        setExportToPDFFlag(0);
      }
    }
    if (MeetingCountClickStatus === "C") {
      if (exportToPDFFlag === 1) {
        exportDataToPDF('tblMeetingDashboardExcelToPdf', [6], 'CompleteMeetingList', 'Completed Meeting List', 'l'); // Assuming 11, 12, 13 are the indices of header columns to be hidden

        setPageSize(5);
        setExportToPDFFlag(0);
      }
    }
    if (MeetingCountClickStatus === "IG") {
      if (exportToPDFFlag === 1) {
        exportDataToPDF('tblMeetingDashboardExcelToPdf', [6], 'InvoiceGeneratedMeetingList', 'Invoice Generated Meeting List', 'l'); // Assuming 11, 12, 13 are the indices of header columns to be hidden

        setPageSize(5);
        setExportToPDFFlag(0);
      }
    }
  }, [exportToPDFFlag]);

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

  const [hoveredIndex] = useState(null);
  const extraColumn = {
    Header: "Action",
    accessor: "action",
    
  };
  
  const updatedColumns = useMemo(() => [...columnsData, extraColumn], [
    columnsData,
  ]);
  
  const columns = useMemo(() => updatedColumns, [updatedColumns]);
  const data = useMemo(() => tableData, [tableData]);

  const tableInstance = useTable(
    {
      columns,
      data: MeetingSummaryCountData,
      initialState: {
        pageIndex: 0,
        pageSize: 5
        //pageSize: parseInt(localStorage.getItem('pageSize') || '10'), // Initialize with saved value or default to 10
      },
      // Include setPageize from useTable hook
      setPageSize: (newSize) => {
        localStorage.setItem('pageSize', newSize);
        setPageSize(newSize);
      },
      
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const {
    initialState,
    setPageSize,
  } = tableInstance;
  initialState.pageSize = 5;

  const [EmployeeFilterValue, setCustomerFilterValue] = useState(0);
  const [SelectedCustomerFilterRow, setSelectedCustomerFilterRow] = useState({ value: 0, label: "--Select Employee--" });
  
  const [CustomerDropDownData, setCustomerDropDownData] = useState([]);
  const [ProjectData, setProjectData] = useState([]);
  const [CustomerId, setCustomerId] = useState(0);
  const selectedOption = { value: 0, label: "--Select--" };
  const [SelectedCustomer, setCustomer] = useState(selectedOption);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Adding 1 since getMonth() returns 0-based index
  const currentYear = currentDate.getFullYear();

  // History Const

  const [OpenEmployeeHistoryModal, setOpenHistoryModal] = useState(false);
  const [HistoryPopupContent, setHistoryPopupContent] = useState('');
  const [MeetingRescheduledHistoryData, setMeetingRescheduledHistoryData] = useState([{}]);

// End History Cost

  const [selectedProjectFilter, setselectedProjectFilter] = useState(selectedOption);
  const [FromDate, setFromDate] = useState('1900-01-01');
  const [ToDate, setToDate] = useState('1900-01-01');

  const [OpenPopupModalFlag, OpenPopupModal] = useState(false);
 

  const [loggedInSessionId] = useState(Cookies.get("LoggedInSessionId"));
  const [loggedInCompanyId] = useState(Cookies.get("LoggedInCompanyId"));
  const [loggedInUserId] = useState(Cookies.get('LoggedInUserId'));
  const [RescheduledHistoryPopupContent, setRescheduledHistoryPopupContent] = useState('');

  const handleCloseButtonClick = () => {
    OpenPopupModal(false)
  };

  const handleClientFilterChange = (event, value) => {
    setCustomer(event);
    setCustomerId(event.value);
}
  const handleProjectFilterChange = (event) => {
    setselectedProjectFilter(event);
  }
  const handleFromDateChangeEvent = (event) => {
    setFromDate(event.target.value); 
  }
  const handleToDateChangeEvent = (event) => {
    setToDate(event.target.value); 
  }

  const handleFilterButtonClick = () => {
  
    const postData = {
      "CompanyId": loggedInCompanyId,
      "SessionId": loggedInSessionId,
      "CustomerId": CustomerId,
      "ProjectId": selectedProjectFilter.value,
      "FromDate": FromDate,
      "ToDate": ToDate,
      "UserId": loggedInUserId
      
    };
    const response = fetch('/MeetingSymmary/getMeetingSummary', {
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
          setMeetingSummaryData(data);
        }
      );
  };

  const handleHistoryCloseButtonClick = () => {
    setOpenHistoryModal(false)
  };

  const handleHistoryButtonClick = (rowData) => {
    // alert(rowData.MeetingId)
    fetch("/meeting/getMeetingRescheduledHistoryDetails?MeetingId=" + rowData.MeetingId, {
      headers: {
        'Authorization': `Bearer ${Token}`,
      },})
      
      .then(res => res.json())
      .then(data => {
        setMeetingRescheduledHistoryData(data);

        console.log(data);

        if (Object.keys(data).length !== 0) {
          //alert('data not null');
          setShowRecordNotFound("collapse");
        } else {
          //alert('data null');
          setShowRecordNotFound("visible");
        }

      });

    const { MeetingTitle, MeetingOn,ActualMeetingDate, TentativeEndDate, MeetingTypeName, MeetingModeName, Venue ,Status,StatusName} = rowData;
    // Update the popup content with the desired information
    setRescheduledHistoryPopupContent({ MeetingTitle, MeetingOn, ActualMeetingDate, TentativeEndDate, MeetingTypeName, MeetingModeName, Venue, Status, StatusName });
    setOpenHistoryModal(true);

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
  const fetchProjectOptions = () => {

    fetch("/project/getSelectionProjectDropDown/"+ loggedInCompanyId).then(
        res => res.json()
    ).then(
      data => {
        setProjectData(data);

        console.log(data);
      }
    )
  };
  const [MeetingCountClickStatus, setMeetingCountClickStatus] = useState("");

  useEffect(() => {
    // handlePopupButtonClick(MeetingCountClickStatus);
   
    }, [MeetingCountClickStatus]);

  const handlePopupButtonClick = (Status) => {
    setMeetingCountClickStatus(Status);
    // alert(Status);
    // alert(MeetingCountClickStatus);
    const postData = {
      "CompanyId": loggedInCompanyId,
      "Status": Status,
      "CustomerId": CustomerId,
      "ProjectId": selectedProjectFilter.value,
      "FromDate": FromDate,
      "ToDate": ToDate,
      "UserId": loggedInUserId
      
    }
    const response = fetch('/MeetingSummary/getCountMeetingSummaryList', {
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
          setMeetingSummaryCountData(data);

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

  const getStatusColor = (status) => {
    // Define background colors for different status values
    const statusColors = {
      OG: 'Yellow',
      E: 'Orange',
      SCH: 'Lime',
      IG: 'Aqua',
      CAN: 'Red',
      RESCH: 'Blue',
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
      OG: 'Black',
      E: 'Black',
      SCH: 'Black',
      IG: 'Black',
      CAN: 'White',
      RESCH: 'White',
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
        <MdTask className="mr-1" style={{ fontSize: '20px', color: "Blue" }} /> {t('Meeting Summary')}
        </div>
        <CardMenu />
      </div>
      
      <div className="mt-1 h-half grid-cols-3 gap-3 md:grid-cols-1" >
        <div className="w-half pr-4" style={{ height: "auto", width: "100%", display: "inline-block", padding: "10px", marginRight: "15px", borderColor: "silver", borderWidth: "1px" }}>

          <div className="relative items-center justify-between">
            <div className="mt-1 grid xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-12 lg:grid-cols-12">
            
              <div className="mt-3 text-sm md:col-span-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
                <label htmlFor="ProjectName">{t('Client')}</label>
              </div>
              <div className="mt-1 text-sm xs:col-span-4 md:col-span-4">

                <Select
                 
                  id="cmbEmployee"

                  value={SelectedCustomer}
                  onChange={handleClientFilterChange}

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
              <div className="mt-3 text-sm md:col-span-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
                <label htmlFor="ProjectName">{t('Project')}</label>
              </div>

              <div className="mt-1 text-sm xs:col-span-4 md:col-span-4">
              <Select
                  id="cmbEmployee"
                  value={selectedProjectFilter}
                  onChange={handleProjectFilterChange}

                  options={[{ value: 0, label: t("--Select--") }, ...ProjectData]}
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
            </div>
          </div>
          <div className="relative items-center justify-between">
            <div className="mt-3 grid xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-12 lg:grid-cols-12">
            
              
              <div className="mt-3 text-sm md:col-span-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
                <label htmlFor="LeaveName">{t('Meeting From')}</label>
              </div>

              <div className="mt-1 text-sm xs:col-span-4 md:col-span-4 lg:col-span-4">
                <input
                  variant="auth"
                  extra="flex"
                  id="Date"
                  type="Date"
                  style={{ border: "solid 1px silver", width: "90%", borderRadius: "5px", padding: "7px" }}
                  
                  onChange={handleFromDateChangeEvent}
                />
              </div>

              <div className="mt-3 text-sm md:col-span-1  xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
                <label htmlFor="LeaveName">{t('To')}</label>
              </div>

              <div className="mt-1 text-sm xs:col-span-3 md:col-span-3 lg:col-span-3">
                <input
                  variant="auth"
                  extra="flex"
                  id="Date"
                  type="Date"
                  style={{ border: "solid 1px silver", width: "90%", borderRadius: "5px", padding: "7px" }}
                 
                  onChange={handleToDateChangeEvent}
                />
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

      <div className="flex flex-wrap pr-4 " style={{ height: "auto", padding: "15px", borderColor: "silver", borderWidth: "1px" }}>
        <div className="flex md:w-1/3">
            <button className="btn side-box-container text-center" style={{position: "relative", verticalAlign: "center", width: "95%", height:"170px", padding: "45px",marginRight: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "Silver", fontWeight: "bold"}} onClick={() => handlePopupButtonClick("Total")}>                                           
              <div className="header-box text-center  ">
               
                <button className="text-sm tracking-wide text-gray-600" style={{ color: "Black", fontSize : "1.8em" }}>
                {t('Total')}
                </button>
              </div>
              <div className="data-box" style={{color: "Black", fontSize : "1.8em"}}>
                {MeetingSummarys[0].TotalMeeting}
              </div>
          </button>
        </div>

        <div className=" flex flex-wrap md: w-2/3" >
          <div className="w-full mb-2" >
            <button className="side-box-container text-center" style={{width: "30%", height: "80px", display: "inline-block", padding: "10px", marginRight: "5px", borderColor: "silver", borderWidth: "1px", backgroundColor: "Blue"}} onClick={() => handlePopupButtonClick("SCH")}>
              <div className="header-box">
              <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "White", background: "none", border: "none", cursor: "pointer" }} >
                {t('Scheduled')}
              </button>
              </div>
              <div className="data-box text-center" style={{ color: "White" }}>
                {MeetingSummarys[0].Scheduled}
              </div>
            </button>

            <button className="side-box-container text-center" style={{ width: "30%", height: "80px", display: "inline-block", padding: "10px",marginRight: "5px", borderColor: "silver", borderWidth: "1px", backgroundColor: "Yellow", color: "Black"}} onClick={() => handlePopupButtonClick("OG")}>                                           
              <div className="header-box">
                <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "Black" }}>
                  {t('On-Going')}
                </button>
              </div>
              <div className="data-box text-center" style={{color: "Black"}}>
                {MeetingSummarys[0].Ongoing}
              </div>
            </button>
          
            <button className="side-box-container text-center" style={{ width: "30%", height: "80px", display: "inline-block", padding: "10px", borderColor: "silver", borderWidth: "1px", backgroundColor: "lightblue" }} onClick={() => handlePopupButtonClick("C")}>
              <div className="header-box">
                <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "Black" }}>
                  {t('Completed')}
                </button>
              </div>
              <div className="data-box text-center" style={{ color: "Black" }}>
                {MeetingSummarys[0].Completed}
              </div>
            </button>
          </div>
          <div className="w-full mb-2" >
            <button className="side-box-container text-center" style={{ width: "30%", height: "80px", display: "inline-block", padding: "10px", marginRight: "5px", borderColor: "silver", borderWidth: "1px", backgroundColor: "Red", marginTop: "" }} onClick={() => handlePopupButtonClick("CAN")}>
              <div className="header-box">
                <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "white" }}>
                  {t('Cancelled')}
                </button>
              </div>
              <div className="data-box text-center" style={{ color: "white" }}>
                {MeetingSummarys[0].Cancelled}
              </div>
            </button>

            <button className="side-box-container text-center" style={{ width: "30%", height: "80px", display: "inline-block", padding: "10px", marginRight: "5px", borderColor: "silver", borderWidth: "1px", backgroundColor: "Orange" }} onClick={() => handlePopupButtonClick("RESCH")}>
              <div className="header-box">
                <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "Black" }}>
                  {t('Rescheduled')}
                </button>
              </div>
              <div className="data-box text-center" style={{ color: "Black" }}>
                {MeetingSummarys[0].Rescheduled}
              </div>
            </button>

            <button className="side-box-container text-center" style={{ width: "30%", height: "80px", display: "inline-block", padding: "0px", borderColor: "silver", borderWidth: "1px", backgroundColor: "lime", marginTop: "" }} onClick={() => handlePopupButtonClick("IG")}>
              <div className="header-box">
                <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "Black" }}>
                  {t('Invoice Generated')}
                </button>
              </div>
              <div className="data-box text-center" style={{ color: "Black" }}>
                {MeetingSummarys[0].InvoiceGenerated}
              </div>
            </button>
          </div>
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
                width: '1200px', // Adjust the width as needed
                height:"690px",
                padding: '10px',
                boxShadow: '0px 0px 100px rgba(0, 0, 0, 0.1)',
                borderRadius: '5px',
                position: "relative"
              },
            }}
             >
              <div>
          <div className="grid grid-cols-2" style={{ fontSize: '18px', fontWeight: "bold", color: 'black', backgroundColor: 'Silver', padding: '10px', borderRadius: " 10px" }}>
            <div className="text-xl dark:text-white" style={{ fontWeight: "bold" }}>{MeetingCountClickStatus === 'Total' ? t("All Meeting List") : MeetingCountClickStatus === 'SCH' ? t("Scheduled Meeting") : MeetingCountClickStatus === 'OG' ? t("On-Going Meeting") : MeetingCountClickStatus === 'C' ? t("Completed Meeting") : MeetingCountClickStatus === 'IG' ? t("Invoice Generated Meeting") : MeetingCountClickStatus === 'CAN' ? t("Cancelled Meeting") : MeetingCountClickStatus === 'RESCH' ? t("Rescheduled Meeting") : t("Meeting List")} </div>
            <div className="" style={{ display: 'flex', justifyContent: 'flex-end', }}>
            
              <button
                onClick={handleCloseButtonClick}
                style={{
                  border: 'none',
                  background: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: 'Red',
                }}
              >
                X
              </button>
              
            </div>
            
          </div>
          <div className="mr-2 mt-1 relative flex items-center justify-between" style={{ display: 'flex', justifyContent: 'flex-end'}}>
                <div className="flex space-x-2">
                  <div className="text-sm text-slate-400 hover:shadow-md border border-green-400 rounded-sm text-right item-right"
                    style={{ width: "40px", padding: '7px', visibility: "collapse" }}>
                    <ReactHTMLTableToExcel
                      id="test-table-xls-button"
                      table="tblMeetingDashboardExcelToPdf"
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
          
          <div className="p-1 overflow-x-scroll sm:overflow-x-auto" style={{ width: '100%', height: "530px" }}>
            <table id="tblMeetingDashboardExcelToPdf" style={{ width: '100%' }}>
              <thead>
                <tr className="text-sm" style={{ backgroundColor: 'Silver', borderRadius: '6px', width: "100px" }}>
                  <th style={{ padding: '10px 0px',width:"5%" }}>
                    {t('#')}
                  </th>
                  <th style={{ padding: '10px 10px', width: "15%",textAlign: "left", }} onClick={toggleSortOrder}>
                    {t('Meeting Title')}
                  </th>

                  {MeetingCountClickStatus !== 'RESCH' && (
                  <th style={{ padding: '10px 10px', width: "10%" ,textAlign: "left", }} onClick={toggleSortOrder}>
                    {t('Meeting Date')}
                  </th>
                  )}

                  {MeetingCountClickStatus === 'RESCH' && (
                  <th style={{ padding: '10px 0px', width: "10%", textAlign: "left", }} onClick={toggleSortOrder}>
                    {t('Rescheduled Date')}
                  </th>
                  )}
                  <th style={{ padding: '10px 10px', width: "10%", textAlign: "left", }} onClick={toggleSortOrder}>
                    {t('Meeting Details')}
                  </th>
                  <th style={{ padding: '10px 10px', width: "10%", textAlign: "left", }} onClick={toggleSortOrder}>
                    {t('Customer')}
                  </th>
                  <th style={{ padding: '10px 10px', width: "10%", textAlign: "left", }} onClick={toggleSortOrder}>
                    {t('Project')}
                  </th>
                  {MeetingCountClickStatus === 'RESCH' && (
                  <th style={{ padding: '10px 10px', width: "15%", textAlign: "left", }} onClick={toggleSortOrder}>
                    {t('Rescheduled Details')}
                  </th>
                  )}
                  {MeetingCountClickStatus === 'CAN' && (
                    <th style={{ padding: '10px 0px', width: "15%", textAlign: "left", }} onClick={toggleSortOrder}>
                      {t('Cancelled Details')}
                    </th>
                  )}
                  <th style={{ padding: '10px 20px', width: "15%", textAlign: "left", }} onClick={toggleSortOrder}>
                    {t('Status')}<br/>
                  </th>
                  {MeetingCountClickStatus === 'IG' && (
                  <th style={{ padding: '10px 10px', width: "10%", textAlign: "left", }} onClick={toggleSortOrder}>
                    {t('Invoice Details')}<br/>
                  </th>
                  )}
                  {MeetingCountClickStatus === 'RESCH' && (
                  <th style={{ padding: '10px 10px', width: "10%" ,textAlign: "left", }} onClick={toggleSortOrder}>
                    {t('Action')}<br />
                  </th>
                  )}
                  
                </tr>
              </thead>
              <tbody style={{ width: '100%' }}>
                {sortData(MeetingSummaryCountData).map((CountData, index) => {
                  return (
                    <tr key={index} style={{ backgroundColor: index % 2 ? 'whitesmoke' : 'white' }}>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "50px" }}>{index + 1}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "500px", textAlign: "left", color: "blue" }}>
                        {CountData.MeetingTitle}
                      </td>
                      {MeetingCountClickStatus !== 'RESCH' && (
                      <td className="text-sm text-navy-700 dark:text-white" style={{textAlign: "left" }}>{CountData.MeetingOn}</td>
                      )}
                      {MeetingCountClickStatus === 'RESCH' && (
                      <td className="text-sm text-navy-700 dark:text-white" style={{textAlign: "left" }}>{CountData.MeetingOn}</td>
                      )}
                      <td
                        className="text-sm text-navy-700 dark:text-white it-align-left"
                        style={{ padding: '10px', textAlign: 'left' }}
                      >
                        <strong style={{ float: 'start' }}>Type: </strong> {CountData.MeetingTypeName} <br />
                        <strong>Mode: </strong> {CountData.MeetingModeName}<br />
                        <strong>Venue: </strong> {CountData.Venue}
                      </td>

                      <td
                        className="text-sm text-navy-700 dark:text-white it-align-left"
                        style={{ padding: '10px', width: '200px', textAlign: 'left' }}
                      >{CountData.CustomerName} </td>
                      <td
                        className="text-sm text-navy-700 dark:text-white it-align-left"
                        style={{ padding: '10px', width: '220px', textAlign: 'left' }}
                      >{CountData.ProjectName}</td>

                      {MeetingCountClickStatus === 'RESCH' && (
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "auto", verticalAlign: "top"}}>

                        <div className={`flex items-left justify-left`} >
                          <span style={{ fontSize: '12px' }}><span style={{ fontWeight: 'bold' }}>By </span> {CountData.RescheduledByEmployeeName}</span>
                        </div>
                        <div className={`flex items-left justify-left`} >
                          <span style={{ fontSize: '12px' }}><span style={{ fontWeight: 'bold' }}>On </span> {CountData.RescheduledOnFormatted}</span>
                        </div>
                        <div className={`flex items-left justify-left`} >
                          <span style={{ fontSize: '12px' }}><span style={{ fontWeight: 'bold' }}>Remarks </span> {CountData.RescheduledRemarks}</span>
                        </div>

                      </td>
                      )}

                      {MeetingCountClickStatus === 'CAN' && (
                        <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "200px", verticalAlign: "top", marginRight: "30px" }}>

                          <div className={`flex items-left justify-left`}>
                            <span style={{ fontSize: '12px' }}><span style={{ fontWeight: 'bold' }}>By </span> {CountData.MeetingCancelledByEmployeeName}</span>
                          </div>
                          <div className={`flex items-left justify-left`}>
                            <span style={{ fontSize: '12px' }}><span style={{ fontWeight: 'bold' }}>On </span> {CountData.MeetingCancelledOnFormatted}</span>
                          </div>
                          <div className={`flex items-left justify-left`}>
                            <span style={{ fontSize: '12px' }}><span style={{ fontWeight: 'bold' }}>Remarks </span> {CountData.MeetingCancelledRemarks}</span>
                          </div>

                        </td>
                      )}
                      
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "180px", verticalAlign: "top", marginRight: "30px" }}>
                        <div className={`flex items-center justify-center rounded-full`} style={{ width: '120px', backgroundColor: getStatusColor(CountData.Status), height: '2em' }}>
                          <span style={{ color: getStatusTextColor(CountData.Status), fontSize: '12px' }}>{CountData.StatusName}</span>
                        </div>
                        <div className={`flex items-left justify-left`}>
                          <span style={{ fontSize: '12px' }}><span style={{ fontWeight: 'bold' }}>By </span> {CountData.StatusUpdatedBy}</span>
                        </div>
                        <div className={`flex items-left justify-left`}>
                          <span style={{ fontSize: '12px' }}><span style={{ fontWeight: 'bold' }}>On </span> {CountData.StatusUpdatedOn}</span>
                        </div>
                        <div className={`flex items-left justify-left`}>
                          <span style={{ fontSize: '12px' }}><span style={{ fontWeight: 'bold' }}>Remarks </span> {CountData.StatusUpdatedRemarks}</span>
                        </div>
                      </td>
                      {MeetingCountClickStatus === 'IG' && (
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "180px", verticalAlign: "top", marginRight: "30px" }}>
                        <div className={`flex items-left justify-left`}>
                          <span style={{ fontSize: '12px' }}><span style={{ fontWeight: 'bold', textAlign: "center" }}></span> {CountData.InvoiceNo}</span>
                        </div>
                        <div className={`flex items-left justify-left`}>
                          <span style={{ fontSize: '12px' }}><span style={{ fontWeight: 'bold' }}>Amt </span> {CountData.InvoiceAmt}</span>
                        </div>
                      </td>
                      )}

                      {MeetingCountClickStatus === 'RESCH' && (
                       <button
                            className="btn btn-history"
                            onClick={() => handleHistoryButtonClick(CountData)}
                            title={hoveredIndex === `edit-${index}` ? "Edit" : "History"}
                            style={{
                              backgroundColor: hoveredIndex === `edit-${index}` ? '#f0f0f0' : '',
                              color: hoveredIndex === `edit-${index}` ? '#000' : '',
                              transition: 'background-color 0.8s ease, color 0.3s ease'
                              // display: setTaskStatusUpdateVisibility(mytask.original.TaskIssue, mytask.original.TaskStatus)
                            }}>
                            {hoveredIndex === `delete-${index}` && "history"}
                            {hoveredIndex !== `delete-${index}` && (
                              <MdHistory className="mr-2" style={{ color: 'Green' }} />
                            )}
                          </button>
                      )}
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
            <button onClick={handleCloseButtonClick} style={{ padding: '10px 20px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: 'Firebrick', color: 'white', marginTop: '5px', marginBottom: '5px' }}>{t('Close')}</button>
          </div>
          {/* <div style={{ bottom: '10px', textAlign: "center" }}>
            <button onClick={handleCloseButtonClick} style={{ padding: '10px 20px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: 'Orange', color: 'white' }}>{t('Close')}</button>
          </div> */}
        </div>
      </Modal>

{/* Rescheduled History */}

      <Modal
        isOpen={OpenEmployeeHistoryModal}
        onRequestCancel={handleHistoryCloseButtonClick}
        contentLabel="Action Modal"
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
          },
          content: {
            top: '51%',
            left: '55%',
            transform: 'translate(-50%, -50%)',
            width: '1000px', // Adjust the width as needed
            height: '600px',
            padding: '30px',
            boxShadow: '0px 0px 100px rgba(0, 0, 0, 0.1)',
            borderRadius: '10px',
            overflow: true,
          },
        }}
      >
        <div>
          <div className="grid grid-cols-2" style={{ fontSize: '18px', fontWeight: "bold", color: 'black', backgroundColor: 'Silver', marginBottom: '20px', marginTop: '-15px', padding: '10px', borderRadius: " 10px",backgroundColor:"orange" }}>
            <div className="">
              {t('Rescheduled Meeting History')}
            </div>
            <div className="" style={{ display: 'flex', justifyContent: 'flex-end', }}>
              <button
                onClick={handleHistoryCloseButtonClick}
                style={{
                  border: 'none',
                  background: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: 'Red'
                }}>
                X
              </button>
            </div>
          </div>

          <div className="border p-1 mb-3" style={{ borderColor: 'black', borderRadius: "10px", padding: '10px' }}>

            <div className="mt-2 grid h-full grid-cols-1">
              <div>
                <strong className="text-sm">{t('Title')} :</strong> {RescheduledHistoryPopupContent.MeetingTitle}
              </div>
            </div>
            <div className="mt-2 grid h-full grid-cols-2">
              {MeetingCountClickStatus === 'RESCH' && (
            <div>
                <strong className="text-sm">{t('Rescheduled Meeting Date')} :</strong> {RescheduledHistoryPopupContent.MeetingOn} <strong>To</strong> {RescheduledHistoryPopupContent.TentativeEndDate}
            </div>
              )}
              {MeetingCountClickStatus !== 'RESCH' && (
              <div>
                <strong className="text-sm">{t('Meeting Date')} :</strong> {RescheduledHistoryPopupContent.MeetingOn} <strong>To</strong> {RescheduledHistoryPopupContent.TentativeEndDate}
              </div>
                )}
              <div>
                <strong className="text-sm">{t('Actual Meeting Date')} :</strong> {RescheduledHistoryPopupContent.ActualMeetingDate} 
              </div>
            </div>
            <div className="mt-2 grid h-full grid-cols-2">
              <div>
                <strong className="text-sm">{t('Meeting Type')} :</strong> {RescheduledHistoryPopupContent.MeetingTypeName}
              </div>
              <div>
                <strong className="text-sm">{t('Mode')} :</strong> {RescheduledHistoryPopupContent.MeetingModeName} 
              </div>
            </div>

            <div className="mt-2 grid h-full grid-cols-2">
              <div>
                <strong className="text-sm">{t('Venue')} :</strong> {RescheduledHistoryPopupContent.Venue}
              </div>
              <div>
                <span className="text-sm" style={{ fontWeight: "bold" }}>{t('Status')} : </span>
                <span className={`text-sm flex items-center text-center rounded-full`} style={{ backgroundColor: getStatusColor(RescheduledHistoryPopupContent.Status), color: getStatusTextColor(RescheduledHistoryPopupContent.Status), height: '2em', width: "140px", display: "inline-block", paddingTop: "3px" }} >{RescheduledHistoryPopupContent.StatusName}</span>
              </div>
            </div>
            
          </div>

          <div className="p-1 overflow-x-scroll sm:overflow-x-auto" style={{ width: '100%', height: "270px", marginBottom: "20px" }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr className="text-sm" style={{ backgroundColor: 'Silver', borderRadius: '6px' }}>
                  <th style={{ padding: '10px 0px', width: "8%" }}>
                    {t('Sr No.')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Previous Meeting Date')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Rescheduled Date')} 
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Rescheduled By')} 
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Rescheduled On')} 
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Rescheduled Remarks')} 
                  </th>
                </tr>
              </thead>
              <tbody style={{ width: '100%' }}>
                {sortData(MeetingRescheduledHistoryData).map((MeetingRescheduledHistory, index) => {
                  return (
                    <tr key={index} style={{ backgroundColor: index % 2 ? 'whitesmoke' : 'white' }}>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "50px" }}>{index + 1}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "370px", textAlign: "center" }}>{MeetingRescheduledHistory.PreviousMeetingDate} </td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "370px", textAlign: "center" }}>{MeetingRescheduledHistory.RescheduledStartDate} </td>
                      <td className="text-sm text-navy-700 dark:text-white text-center" style={{ padding: '10px', width: "220px" }}>{MeetingRescheduledHistory.RescheduledByEmployeeName}</td>
                      <td className="text-sm text-navy-700 dark:text-white text-center" style={{ padding: '10px', width: "220px" }}>{MeetingRescheduledHistory.RescheduledOn}</td>
                      <td className="text-sm text-navy-700 dark:text-white text-center" style={{ padding: '10px', width: "220px" }}>{MeetingRescheduledHistory.RescheduledRemarks}</td>
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
            <button onClick={handleHistoryCloseButtonClick} style={{ padding: '10px 20px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: 'Firebrick', color: 'white', marginBottom: "-20px" }}>{t('Close')}</button>
          </div>

        </div>

      </Modal>

          </Card>
  );
};

export default TaskSummary;
