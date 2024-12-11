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
import { FcVoicePresentation } from "react-icons/fc";

import { exportDataToExcel, exportDataToPDF } from 'components/ExportUtils/ExportUtils';
import { FaFileExcel, FaFilePdf, FaListAlt } from "react-icons/fa"
import ReactHTMLTableToExcel from 'react-html-table-to-excel';

const getStatusColor = (status) => {
  // Define colors for different status values
  const statusColors = {
    P: 'lightblue',
    A: 'Red',
    L: 'yellow',
    LWP: 'Orange',
    H: 'green',
    HHA: 'brown',
    HHP: 'violet'
    
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

const getStatusTextColor = (status) => {
  // Define colors for different status values
  const statusColors = {
    A: 'White',
    P: 'Black',
    L: 'Black',
    LWP: 'White',
    H: 'White',
    HHA: 'White',
    HHP: 'Black'
    
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


const TodaysAttendance = (props) => {

  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
  const [Token] = useState(Cookies.get("Token"));

  const [loggedInSessionId] = useState(Cookies.get("LoggedInSessionId"));
  const [loggedInEmployeeId] = useState(Cookies.get("LoggedInEmployeeId"));
  const [loggedInCompanyId] = useState(Cookies.get("LoggedInCompanyId"));
  
  const handleExportExcel = () => {
    // Logic for exporting to Excel
  };

  const handleExportPdf = () => {
    // Logic for exporting to PDF
  };

  const [showRecordNotFound, setShowRecordNotFound] = useState('hidden');

  const [TodaysAttendances, setTodaysAttendanceData] = useState([{}]);

  useEffect(() => {

    handleFilterButtonClick();

   
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
        exportDataToExcel('tblTodayAttendance', null, 'TodayAttendanceList', [2]); // first array should be coulumn(action) or second Style-color

        setExportToExcelFlag(0);
      }
    }, [exportToExcelFlag]);
    
  
    useEffect(() => {
      if (exportToPDFFlag === 1) {
        exportDataToPDF('tblTodayAttendance', null, 'TodayAttendanceList', 'Todays Attendance List', 'p'); // Assuming 11, 12, 13 are the indices of header columns to be hidden

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

  const handleFilterButtonClick = () => {

    const postData = 
    {
      "CompanyId": loggedInCompanyId,
      "Sessionid": loggedInSessionId,
      "EmployeeId": loggedInEmployeeId
    };
    const response = fetch('/TodaysAttendance/getTodaysAttendance', {
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
          setTodaysAttendanceData(data);
  
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

  return (
    <Card extra={"w-full h-full p-3"}>
      
      <div className="relative flex items-center justify-between">
      <div class="text-xl font-bold text-navy-700 dark:text-white" style={{ display: "inline-flex", alignItems: "center" }}>
          <FcVoicePresentation className="mr-1" style={{ fontSize: '20px', color: "Blue" }} /> {t('Todays Attendance')}
        </div>
      <div className="flex space-x-2" style={{ paddingRight: "2.5%" }}>
          
          <div className="text-sm text-slate-400 hover:shadow-md border border-green-400 p-1 px-2 rounded-sm text-center item-center" 
          style={{width:"40px", padding: '7px 5px', visibility:"collapse" }}>
            <ReactHTMLTableToExcel
              id="test-table-xls-button"
              table="tblTodayAttendance"
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
      <div className="overflow-scroll sm:overflow-auto" style={{ height: "340px"}}>
          <table {...getTableProps()} id ="tblTodayAttendance" className="w-full1">
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700" style={{ width: "60px" }}
                          >
                            <p className="text-sm tracking-wide text-gray-600" style={{ color: "black" , marginLeft: "10px"}}>
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
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700"
                          >
                            <p className="text-sm tracking-wide text-left text-gray-600" style={{ color: "black", width: "150px" }}>
                            {t('Employee Name')}
                            </p>
                          </th>
                        );
                      } 

                      else if (column.render("Header") === "Attend Status") {
                        data = (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={index}
                            className="border-b border-gray-200 pr-281 pb-[10px] text-start dark:!border-navy-700">
                            <p className="text-sm tracking-wide text-gray-600 text-center " style={{ color: "black", width: "140px" }}>
                              {t("Attend Status")}
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
              {TodaysAttendances.map((TodaysAttendance, index) => {
                return (
                  <tr key={index} style={{ backgroundColor: index % 2 ? 'whitesmoke' : 'white' }} >
                    {Object.keys(TodaysAttendance).map((keyElement, index1) => {
                      let data = "";

                     if(keyElement === "SessionId") {
                      data = (
                         <p className="text-sm text-navy-700 dark:text-white text-center" style={{ width: "40px" }}>
                           {index+1}
                        </p>
                      );
                      } 
                      
                     else if (keyElement === "EmployeeName") {
                       data = (
                         <p className="text-sm  text-navy-700 text-left dark:text-white" style={{ width: "140px"}}>
                           {TodaysAttendance.EmployeeName} ({TodaysAttendance.EmployeeCode})
                         </p>
                       );
                     }
                     
                     else if (keyElement === "AttendStatus") {
                      const statusColor = getStatusColor(TodaysAttendance.AttendStatus);
                      const statusTextColor = getStatusTextColor(TodaysAttendance.AttendStatus);

                      data = (
                        <div className="text-sm  text-navy-700 dark:text-white" style={{ width: "140px", margin: "0 auto" }}>
                          <div className={`flex items-center justify-center rounded-full `} style={{ width: '90%', margin: "0 auto", backgroundColor: statusColor, height: '2em' }}>
                            <span style={{ color: statusTextColor, fontSize: '12px' }}>{TodaysAttendance.AttendStatus}</span>
                          </div>
                        </div>
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
export default TodaysAttendance;
