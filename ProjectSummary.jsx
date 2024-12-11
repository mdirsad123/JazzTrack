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

  const handleExportToExcel = () => {
    setExportToExcelFlag(1);
  };

  const handleExportToPDF = () => {
    setExportToPDFFlag(1);
  };

  useEffect(() => {
    if (exportToExcelFlag === 1) {
      exportDataToExcel('tblProjectSummary', [], 'ProjectSummary', [6]); // first array should be coulumn(action) or second Style-color
      setExportToExcelFlag(0);
    }
  }, [exportToExcelFlag]);
  
  useEffect(() => {
    if (exportToPDFFlag === 1) {
      exportDataToPDF('tblProjectSummary', [], 'ProjectSummary', 'Project Summary List', 'l'); // Assuming 11, 12, 13 are the indices of header columns to be hidden
      setExportToPDFFlag(0);
    }
  }, [exportToPDFFlag]);
  // *************************

  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
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
  
  const [Token] = useState(Cookies.get("Token"));

  const [showRecordNotFound, setShowRecordNotFound] = useState('hidden');

  const [ProjectSummarys, setTaskSummaryData] = useState([{}]);

  useEffect(() => {
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

  const [OpenPopupModalFlag, OpenPopupModal] = useState(false);
  const [ProjectSummaryCountData, setProjectSummaryCountData] = useState([]);
  const [loggedInSessionId] = useState(Cookies.get("LoggedInSessionId"));
  const [loggedInCompanyId] = useState(Cookies.get("LoggedInCompanyId"));
  // const [ManagerId, setManagerId] = useState(0);


  const handleCloseButtonClick = () => {
    OpenPopupModal(false)
  };

  const handleCustomerFilterChange = (event, value) => {
    setCustomer(event);
    setCustomerId(event.value);
  }

  const handleFilterButtonClick = () => {

    const postData = {
      "CompanyId": loggedInCompanyId,
      "SessionId": loggedInSessionId,
      "CustomerId": CustomerId,
      
    };
    const response = fetch('/ProjectSymmary/getProjectSummary', {
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
  const [ProjectCountClickStatus, setProjectCountClickStatus] = useState("");

  useEffect(() => {
    // handlePopupButtonClick(ProjectCountClickStatus);
   
    }, [ProjectCountClickStatus]);

  const handlePopupButtonClick = (Status) => {
    setProjectCountClickStatus(Status);

    const postData = {
      "CompanyId": loggedInCompanyId,
      "Status": Status,
      "CustomerId": CustomerId,
      
    };
    const response = fetch('/projectSummary/getCountProjectummaryList', {
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
          setProjectSummaryCountData(data);
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
      APP: 'green',
      REJ: 'Red',
      CAN: 'orange',
      C: 'green',
      CL: 'Maroon',
      IP: 'CornflowerBlue',
      N: 'PaleTurquoise',
      QC: 'MediumSeaGreen',
      UP: 'RosyBrown',
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
      APP: 'White',
      REJ: 'white',
      CAN: 'white',
      C: 'White',
      CL: 'White',
      IP: 'White',
      N: 'Black',
      QC: 'Black',
      UP: 'White',
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
        <MdTask className="mr-1" style={{ fontSize: '20px', color: "Blue" }} /> {t('Project Summary')}
        </div>
        <CardMenu />
      </div>
      
      <div className="mt-1 h-half grid-cols-3 gap-3 md:grid-cols-1" >
        <div className="w-half pr-4" style={{ height: "auto", width: "100%", display: "inline-block", padding: "10px", marginRight: "15px", borderColor: "silver", borderWidth: "1px" }}>

          <div className="relative items-center justify-between">
            <div className="mt-1 grid xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-12 lg:grid-cols-12">
            

              <div className="mt-3 text-sm md:col-span-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
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

      <div className="flex flex-wrap pr-4 " style={{ height: "auto",  padding: "15px", borderColor: "silver", borderWidth: "1px" }}>
        <div className="md:w-1/6">
            <button className="side-box-container text-center" style={{position: "relative", verticalAlign: "center", width: "95%", height:"150px", padding: "45px",marginRight: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "Silver", fontWeight: "bold"}} onClick={() => handlePopupButtonClick("Total")}>                                           
              <div className="header-box text-center  ">
                <p className="text-sm tracking-wide text-gray-600" style={{ color: "Black", fontSize : "1.8em" }}>
                  {t('Total')}
                </p>
              </div>
              <div className="data-box" style={{color: "Black", fontSize : "1.8em"}}>
                {ProjectSummarys[0].TotalProject}
              </div>
          </button>
        </div>
        <div className="md: w-5/6">
          <button className="side-box-container text-center" style={{width: "30%", display: "inline-block", padding: "10px", marginRight: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "Blue"}} onClick={() => handlePopupButtonClick("PND")}>
            <div className="header-box">
              <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "White", background: "none", border: "none", cursor: "pointer" }}>
                {t('Pending')}
              </button>
            </div>
            <div className="data-box text-center" style={{ color: "White" }}>
              {ProjectSummarys[0].Pending}
            </div>
          </button>


          <button className="side-box-container text-center" style={{width: "30%", display: "inline-block", padding: "10px",marginRight: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "Yellow", color: "Black"}} onClick={() => handlePopupButtonClick("APP")}>                                           
            <div className="header-box">
              <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "Black" }}>
                {t('Approved')}
              </button>
            </div>
            <div className="data-box text-center" style={{color: "Black"}}>
              {ProjectSummarys[0].Approved}
            </div>
          </button>
          <button className="side-box-container text-center" style={{width: "30%", display: "inline-block", padding: "10px",marginRight: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "lightgreen"}} onClick={() => handlePopupButtonClick("REJ")}>                                           
            <div className="header-box">
              <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "Black" }}>
                {t('Rejected')}
              </button>
            </div>
            <div className="data-box text-center" style={{color: "Black"}}>
              {ProjectSummarys[0].Rejected}
            </div>
          </button>

          <div className="mt-4 text-sm md:col-span-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
            
          </div>

          <button className="side-box-container text-center" style={{width: "30%", display: "inline-block", padding: "10px",marginRight: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "lightblue"}} onClick={() => handlePopupButtonClick("CAN")}>                                           
            <div className="header-box">
              <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "Black" }}>
                {t('Cancelled')}
              </button>
            </div>
            <div className="data-box text-center" style={{color: "Black"}}>
              {ProjectSummarys[0].Cancelled}
            </div>
          </button>
          
          <button className="side-box-container text-center" style={{width: "30%", display: "inline-block", padding: "10px",borderColor: "silver", borderWidth: "1px", backgroundColor: "lime"}} onClick={() => handlePopupButtonClick("IP")}>                                           
            <div className="header-box">
              <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "Black" }}>
                {t('In-Progress')}
              </button>
            </div>
            <div className="data-box text-center" style={{color: "Black"}}>
              {ProjectSummarys[0].InProgress}
            </div>
          </button>
          <button className="side-box-container text-center" style={{width: "30%", display: "inline-block", padding: "10px",marginRight: "15px",marginLeft: "15px", borderColor: "silver", borderWidth: "1px", backgroundColor: "Green", color: "white"}} onClick={() => handlePopupButtonClick("C")}>                                           
            <div className="header-box">
              <button className="text-sm tracking-wide text-gray-600 text-center" style={{ color: "White" }}>
                {t('Completed')}
              </button>
            </div>
            <div className="data-box text-center" style={{color: "White"}}>
              {ProjectSummarys[0].Competed}
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
                width: '1000px', // Adjust the width as needed
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
          <div className="text-xl dark:text-white" style={{ fontWeight: "bold" }}>{ProjectCountClickStatus==='Total'? t("Total Projects"):ProjectCountClickStatus==='PND'? t("Pending Projects"):ProjectCountClickStatus==='APP'? t("Approved Projects"):ProjectCountClickStatus==='REJ'? t("Rejected Projects"):ProjectCountClickStatus==='CAN'? t("Cancelled Projects"):ProjectCountClickStatus==='IP'? t("In-Progress Projects"):ProjectCountClickStatus==='C'? t("Completed Projects"):t("Projects List")} </div>
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
                    table="tblProjectSummary"
                    filename="departmentList"
                    sheet="DepartmentList"
                    buttonText={<><FaFileExcel className="cursor-pointer text-base text-green-500 hover:text-green-700 mr-1" /></>}
                    
                  />
                </div>

                <button onClick={handleExportToExcel} className="text-sm text-slate-400 hover:shadow-md border border-green-400 px-2 rounded-sm">
                  <FaFileExcel className="cursor-pointer text-base text-green-500 hover:text-green-700 mr-1" /> {/* Adjust width, height, and color as needed */}
                </button>

                <button onClick={handleExportToPDF} className="text-sm text-slate-400 hover:shadow-md border border-red-400 px-2 rounded-sm">
                  <FaFilePdf className="cursor-pointer text-base text-red-500 hover:text-red-700 mr-1" /> {/* Adjust width, height, and color as needed */}
                </button>
              </div>
            <CardMenu />
          </div>
          <div className="p-1 overflow-x-scroll sm:overflow-x-auto" style={{ width: '100%', height: "auto",minHeight:"250px",  maxHeight: "500px" }}>
            <table id='tblProjectSummary' style={{ width: '100%' }}>
              <thead>
                <tr className="text-sm" style={{ backgroundColor: 'Silver', borderRadius: '6px', width: "100px" }}>
                  <th style={{ padding: '10px 0px' }}>
                    {t('Sr No.')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Project Name')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Customer Name')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Project Cost')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Target Start Date')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Target End Date')}
                  </th>
                  <th style={{ padding: '10px 0px' }} onClick={toggleSortOrder}>
                    {t('Status')}
                  </th>
                  
                </tr>
              </thead>
              <tbody style={{ width: '100%' }}>
                {sortData(ProjectSummaryCountData).map((CountData, index) => {
                  return (
                    <tr key={index} style={{ backgroundColor: index % 2 ? 'whitesmoke' : 'white' }}>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "50px" }}>{index + 1}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "170px", textAlign: "center" }}>{CountData.ProjectName}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "170px", textAlign: "center" }}>{CountData.CustomerName}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "220px", textAlign: "center" }}>{CurrencyIcon} {CountData.ProjectCost}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "140px", textAlign: "center" }}>{CountData.TargetStartDateFormatted}</td>
                      <td className="text-sm text-navy-700 dark:text-white" style={{ padding: '10px', width: "140px", textAlign: "center" }}>{CountData.TargetEndDateFormatted}</td>

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

          </Card>
  );
};

export default TaskSummary;
