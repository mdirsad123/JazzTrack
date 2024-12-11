// import MiniCalendar from "components/calendar/MiniCalendar";
import Calendar from "react-calendar";
import Card from "components/card";
import "react-calendar/dist/Calendar.css";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import Select from 'react-select';
import "assets/css/Attendance.css"
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import CardMenu from "components/card/CardMenu";
import { FcCalendar } from "react-icons/fc";
import { useTranslation } from 'react-i18next'; //By Md Irsad - 30-August-2024 (For Globalization)

const EmpAttendCalendar = () => {
  
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
  const [Token] = useState(Cookies.get("Token"));

  const [loggedInEmployeeId] = useState(Cookies.get("LoggedInEmployeeId"));
  const [loggedInSessionId] = useState(Cookies.get("LoggedInSessionId"));
  const [loggedInCompanyId] = useState(Cookies.get("LoggedInCompanyId"));

  // getting start date and end date
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Adding 1 since getMonth() returns 0-based index
  const currentYear = currentDate.getFullYear();

  // Function to get the name of the month
  const getMonthName = (month) => {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return monthNames[month - 1]; // Subtracting 1 to match 0-based index
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1); // -1 to match 0-based index
  const lastDayOfMonth = new Date(currentYear, currentMonth, 0);

  const [monthStartDate] = useState(firstDayOfMonth);
  const [monthEndDate] = useState(lastDayOfMonth);

  const [MyCalendar, setMyCalendar] = useState(1);

  const handleCheckboxChange = (event) => {
    setMyCalendar(event.target.checked ? 1 : 0);
  };

  // end start date and end data 

  // Start fetching data for calendar in ForDatabase
  const [leaveDates, setLeaveDates] = useState([]);
  const [absentDates, setAbsentDates] = useState([]);
  const [presentDates, setPresentDates] = useState([]);
  const [weekOffDates, setweekOffDates] = useState([]);
  const [holidayDates, setholidayDates] = useState([]);
  const [LeaveWPDates, setLeaveWPDates] = useState([]);
  const [HalfHolidayPresentDates, setHalfHolidayPresentDates] = useState([]);
  const [HalfHolidayAbsentDates, setHalfHolidayAbsentDates] = useState([]);


  const [attendanceCounts, setAttendanceCounts] = useState({ P: 0, A: 0, L: 0, LWP: 0, WO: 0, FD: 0, HHP: 0, HHA: 0});

  //Following constant will change on Calendare Month / year change or Month / year filter change
  const [selectedCalendarMonth, setSelectedCalendarMonth] = useState(currentMonth);
  const [selectedCalendarYear, setSelectedCalendarYear] = useState(currentYear);

  const [selectedFilterMonth, setSelectedFilterMonth] = useState(currentMonth); 
  const [selectedFilterMonthRow, setSelectedFilterMonthRow] = useState({ value: currentMonth, label: getMonthName(currentMonth) });

  const [selectedFilterYear, setSelectedFilterYear] = useState(currentYear);
  
  const [selectedFilterEmployeeId, setselectedFilterEmployeeId] = useState(0);
  const [EmployeeNameData, setEmployeeNameData] = useState([]);
  const selectedEmployeeOption = { value: 0, label: "--Select Employee--" };

  const [SelectedEmployee, setEmployeeNameDropdown] = useState(selectedEmployeeOption);
  
  const [selectedDate, setselectedDate] = useState(currentDate) //For setting calender date as per selected Month and Year on Search Button Click
  const [activeStartDate, setActiveStartDate] = useState(currentDate) //For setting calender date as per selected Month and Year on Search Button Click
  const [TotalDays, setTotalDays] = useState('');

  useEffect(() => {
    const todayDate = new Date();
    const year = todayDate.getFullYear();
    const month = todayDate.getMonth() + 1;
  
    // Get the total days in the current month
    const totalDaysInMonth = new Date(year, month, 0).getDate();
  
    setTotalDays(totalDaysInMonth); // Set the total days in state
  }, []);

  useEffect(()=>{
    fetchEmployeeName(loggedInCompanyId);
  }, []);

  useEffect(() => {
    // alert(selectedCalendarMonth);
    // alert(selectedCalendarYear);

    const NewSelectedDate = new Date(selectedCalendarYear, selectedCalendarMonth - 1, 1);
  
    setActiveStartDate(NewSelectedDate);

    fetchAttendanceDateForCalendar();
    
  }, [selectedCalendarMonth, selectedCalendarYear]);


  const handleEmployeeFilterChange = (event, value) => {
    setEmployeeNameDropdown(event);
    setselectedFilterEmployeeId(event.value);
  }
  const handleMonthFilterChange = (value) => {
    const selectedValue = value["value"];
    
    setSelectedFilterMonth(selectedValue);
    setSelectedFilterMonthRow(value);
  }
  
  const handleYearFilterChange = (value) => {
    var ChangedYear = value.target.value;
    
    setSelectedFilterYear(ChangedYear); 
  }

  const handleFilterButtonClick = () => {
    // alert("handleFilterButtonClick");

    // alert(selectedFilterMonth);

    if (selectedFilterMonth !== selectedCalendarMonth || selectedFilterYear !== selectedCalendarYear){
      // alert('dates are different');
      setSelectedCalendarMonth(selectedFilterMonth);
      setSelectedCalendarYear(selectedFilterYear);
    }
    else{
      // alert('dates are same');

      fetchAttendanceDateForCalendar();
    }
    
  }

  const fetchAttendanceDateForCalendar = async () => {
    // alert("fetchAttendanceDateForCalendar function called");
    if (MyCalendar !== 1){
      if(selectedFilterEmployeeId === '' || selectedFilterEmployeeId === 0){
        alert("Please Select Employee");
        return;
      }
    }
    if (selectedCalendarMonth === '' || selectedCalendarMonth === 0){
      alert("Please Select Month");
      return;
    }

    if ((selectedCalendarYear === '' || selectedCalendarYear === 0)) {
      alert("Please Select Year");
      return;
    }
    else{
      try {
        const postData = 
        { 
          "CompanyId": loggedInCompanyId,
          "EmployeeId": MyCalendar===1 ? loggedInEmployeeId : selectedFilterEmployeeId,
          "Month": selectedCalendarMonth,
          "Year": selectedCalendarYear,
        };
        const response = await fetch('/Attendance/getAttendanceDataForCalendar', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Token}`,
          },
          body: JSON.stringify(postData)
        });
        const data = await response.json();
        // alert(selectedCalendarMonth);
        // alert("Attendnace Data");
        // alert(JSON.stringify(data));
        // console.log("Attendance Data : ", data);
        // var dt = new Date(data[0].AttendDate) 
        // alert(new Date(data[0].AttendDate));
        // alert(new Date(data[0].AttendDate).getMonth());
        // alert(selectedCalendarMonth);
        // alert(new Date(data[0].AttendDate).getFullYear());
        // alert(selectedCalendarYear);

        // start count the attendance
        const absentCount = data.filter(item => item.AttendStatus === 'A' && new Date(item.AttendDate).getMonth()+1 === selectedCalendarMonth && new Date(item.AttendDate).getFullYear() === selectedCalendarYear).length;
        const leaveCount = data.filter(item => item.AttendStatus === 'L' && new Date(item.AttendDate).getMonth()+1 === selectedCalendarMonth && new Date(item.AttendDate).getFullYear() === selectedCalendarYear).length;
        const presentCount = data.filter(item => item.AttendStatus === 'P' && new Date(item.AttendDate).getMonth()+1 === selectedCalendarMonth && new Date(item.AttendDate).getFullYear() === selectedCalendarYear).length;
        const leaveWPCount = data.filter(item => item.AttendStatus === 'LWP' && new Date(item.AttendDate).getMonth()+1 === selectedCalendarMonth && new Date(item.AttendDate).getFullYear() === selectedCalendarYear).length;
        const weekOffCount = data.filter(item => item.AttendStatus === 'W' && new Date(item.AttendDate).getMonth()+1 === selectedCalendarMonth && new Date(item.AttendDate).getFullYear() === selectedCalendarYear).length;
        const holidayCount = data.filter(item => item.AttendStatus === 'H' && new Date(item.AttendDate).getMonth()+1 === selectedCalendarMonth && new Date(item.AttendDate).getFullYear() === selectedCalendarYear).length;
        const halfHolidayPresent = data.filter(item => item.AttendStatus === 'HHP' && new Date(item.AttendDate).getMonth()+1 === selectedCalendarMonth && new Date(item.AttendDate).getFullYear() === selectedCalendarYear).length;
        const halfHolidayAbsent = data.filter(item => item.AttendStatus === 'HHA' && new Date(item.AttendDate).getMonth()+1 === selectedCalendarMonth && new Date(item.AttendDate).getFullYear() === selectedCalendarYear).length;

        const newAttendanceCounts = { P: presentCount, A: absentCount, L: leaveCount, LWP:  leaveWPCount, WO: weekOffCount, FD: holidayCount, HHP: halfHolidayPresent, HHA: halfHolidayAbsent};
        setAttendanceCounts(newAttendanceCounts);
        // end count attendance
    
        const newAbsentDates = [];
        const newLeaveDates = [];
        const newPresentDates = [];
        const newLeaveWPDates = [];
        const newWeekOffDates = [];
        const newHolidayDates = [];
        const newHalfHolidayPresentDates = [];
        const newHalfHolidayAbsentDates = [];
    
        data.forEach(item => {
          if (item.AttendStatus === 'A' && new Date(item.AttendDate).getMonth()+1 === selectedCalendarMonth && new Date(item.AttendDate).getFullYear() === selectedCalendarYear) {
            newAbsentDates.push(new Date(item.AttendDate));
          }
          else if (item.AttendStatus === 'L' && new Date(item.AttendDate).getMonth()+1 === selectedCalendarMonth && new Date(item.AttendDate).getFullYear() === selectedCalendarYear) {
            newLeaveDates.push(new Date(item.AttendDate));
          }
          else if (item.AttendStatus === 'P' && new Date(item.AttendDate).getMonth()+1 === selectedCalendarMonth && new Date(item.AttendDate).getFullYear() === selectedCalendarYear) {
            newPresentDates.push(new Date(item.AttendDate));
          }
          else if (item.AttendStatus === 'LWP' && new Date(item.AttendDate).getMonth()+1 === selectedCalendarMonth && new Date(item.AttendDate).getFullYear() === selectedCalendarYear) {
            newLeaveWPDates.push(new Date(item.AttendDate));
          }
          else if (item.AttendStatus === 'W' && new Date(item.AttendDate).getMonth()+1 === selectedCalendarMonth && new Date(item.AttendDate).getFullYear() === selectedCalendarYear) {
            newWeekOffDates.push(new Date(item.AttendDate));
          }
          else if (item.AttendStatus === 'H' && new Date(item.AttendDate).getMonth()+1 === selectedCalendarMonth && new Date(item.AttendDate).getFullYear() === selectedCalendarYear) {
            newHolidayDates.push(new Date(item.AttendDate));
          }
          else if (item.AttendStatus === 'HHP' && new Date(item.AttendDate).getMonth()+1 === selectedCalendarMonth && new Date(item.AttendDate).getFullYear() === selectedCalendarYear) {
            newHalfHolidayPresentDates.push(new Date(item.AttendDate));
          }
          else if (item.AttendStatus === 'HHA' && new Date(item.AttendDate).getMonth()+1 === selectedCalendarMonth && new Date(item.AttendDate).getFullYear() === selectedCalendarYear) {
            newHalfHolidayAbsentDates.push(new Date(item.AttendDate));
          }
        });
 
        setAbsentDates(newAbsentDates);
        setLeaveDates(newLeaveDates);
        setPresentDates(newPresentDates);
        setLeaveWPDates(newLeaveWPDates);
        setweekOffDates(newWeekOffDates);
        setholidayDates(newHolidayDates);
        setHalfHolidayPresentDates(newHalfHolidayPresentDates);
        setHalfHolidayAbsentDates(newHalfHolidayAbsentDates);

      } catch (error) {
        console.error("Error fetching calendar data:", error);
      }
    }
    
  };

  const handleCalendarMonthChange = (newDate) => {
    const CurrentCalendarMonth = newDate.activeStartDate.getMonth()+1;
    const CurrentCalendarYear = newDate.activeStartDate.getFullYear();
    
    const totalDaysInMonth = new Date(CurrentCalendarYear, CurrentCalendarMonth, 0).getDate();
    setTotalDays(totalDaysInMonth)

    // Setting selected Calender Month and Year
    setSelectedCalendarMonth(CurrentCalendarMonth);
    setSelectedCalendarYear(CurrentCalendarYear);
    
    //For selecting Month and Year filter Dropdown
    setSelectedFilterMonth(CurrentCalendarMonth);
    setSelectedFilterMonthRow({"value": CurrentCalendarMonth, "label": getMonthName(CurrentCalendarMonth)});

    setSelectedFilterYear(CurrentCalendarYear);
  }
    // ending fetching data for calendar in ForDatabase
  
  const isWeekOffDate = (date) => {
    return weekOffDates.some(
      (weekOffDate) => date.toDateString() === weekOffDate.toDateString()
    );
  };

  const isHolidayDate = (date) => {
    return holidayDates.some(
      (holidayDate) => date.toDateString() === holidayDate.toDateString()
    );
  };

  const isLeaveDate = (date) => {
    return leaveDates.some(
      (leaveDate) => date.toDateString() === leaveDate.toDateString()
    );
  };

  const isLeaveWOPayDate = (date) => {
    return LeaveWPDates.some(
      (leaveWOPayDate) => date.toDateString() === leaveWOPayDate.toDateString()
    );
  };

  const isAbsentDate = (date) => {
    return absentDates.some(
      (absentDate) => date.toDateString() === absentDate.toDateString()
    );
  };
  const isPresentDate = (date) => {
    return presentDates.some(
      (presentDates) => date.toDateString() === presentDates.toDateString()
    );
  };
  const isHalfHolidayPresntDate = (date) => {
    return HalfHolidayPresentDates.some(
      (HalfHolidayPresentDates) => date.toDateString() === HalfHolidayPresentDates.toDateString()
    );
  };
  const isHalfHolidayAbsentDate = (date) => {
    return HalfHolidayAbsentDates.some(
      (HalfHolidayAbsentDates) => date.toDateString() === HalfHolidayAbsentDates.toDateString()
    );
  };

  const isBeforeAfterMonthStartEndDate = (date) => {
    if (new Date(date.toDateString()) < new Date(monthStartDate.toDateString())){
      // alert("Date less than Month Start Date");
      return 1;
    }
    else if (new Date(date.toDateString()) > new Date(monthEndDate.toDateString())){
      // alert("Date greater than Month End Date");
      return 1;
    }
    else{
      return 0;
    }
  };

  const setDateClassName = ({ date, view }) => {
    if (view === 'month') {
      return isWeekOffDate(date)? "weekOffCSS": isHolidayDate(date)? "holidayCSS": isHalfHolidayPresntDate(date)? "halfHolidayPresentCSS" : isHalfHolidayAbsentDate(date)? "halfHolidayAbsentCSS": isLeaveDate(date)? "leaveCSS": isLeaveWOPayDate(date)? "leaveWOPayCSS": isAbsentDate(date)? "absentCSS": isPresentDate(date)? "presentCSS": isBeforeAfterMonthStartEndDate(date)===0? "": "";
    }
  };
  const fetchEmployeeName = (CompanyId) => {
    // alert("fetchEmployeeName");

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
      <div class="relative flex items-center">
        <div class="text-xl font-bold text-navy-700 dark:text-white" style={{ display: "inline-flex", alignItems: "center" }}>
          <FcCalendar className="mr-1" style={{ fontSize: '20px', color: "Blue" }} /> {t('Attendance Calendar')}
        </div>
        <div className="mt-2 text-sm md:col-span-2 gap-2 ">  
        <div style={{ display: "flex", alignItems: "center" }}>            
          <input
            id="MyCalendar" 
            type="checkbox"
            style={{ border : "solid 1px silver", width: "40px", borderRadius: "5px", height: "20px" }}
            onChange={handleCheckboxChange}
            checked={MyCalendar === 1}
          />
          <label htmlFor="MyCalendar" style={{ display: "inline-block", marginLeft: "5px", position: "relative" }}>{t('My Calendar')}</label>
        </div>
      </div>
        <CardMenu />
      </div>
      <div className="mt-1 h-half grid-cols-3 gap-3 md:grid-cols-1" >
        <div className="w-half pr-1" style={{ height: "auto", width: "100%", display: "inline-block", padding: "5px", borderColor: "silver", borderWidth: "1px" }}>

          <div className="relative items-center justify-between">
            <div className="mt-1 grid xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-12 lg:grid-cols-12">
              
              
              <div className="mt-3 text-sm md:col-span-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
                <label htmlFor="ProjectName">{t('Employee')}</label>{MyCalendar !== 1 && (<label style={{ color: "red" }}>*</label>)}
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
                 isDisabled={MyCalendar === 1}
               />
              </div>
              
              <div className="mt-3 text-sm md:col-span-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
                <label htmlFor="ProjectName">{t('Month')}</label><label style={{ color: "red" }}>*</label>
              </div>

              
                <div className="mt-1 text-sm xs:col-span-2 md:col-span-2">
                  <Select
                    id="cmbMonth"
                    value={selectedFilterMonthRow || selectedFilterMonth}
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
                id="cmbYear"
                style={{ border: "solid 1px silver", width: "70%", borderRadius: "5px", padding: "7px" }}
                value={selectedFilterYear}
                onChange={handleYearFilterChange}
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
        <div className="mt-5 text-sm md:col-span-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
          <div className="mt-1 text-sm xs:col-span-1 md:col-span-1">
          </div>
        </div>

      </div>
                <div className="grid grid-cols-12 rounded-[15px]">
                  <div className="col-span-8 rounded-[10px]">
                    {/* <div style={{"border":"1px solid silver", padding:"10px"}}> */}
                    <div className="w-half pr-1" style={{ height: "auto", width: "100%", display: "inline-block", padding: "10px", marginRight: "1px", borderColor: "silver", borderWidth: "1px" }}>
                    <Calendar
                      prevLabel={<MdChevronLeft className="ml-1 h-6 w-6" />}
                      nextLabel={<MdChevronRight className="ml-1 h-6 w-6" />}
                      view="month"
                      value={selectedDate}
                      activeStartDate = {activeStartDate}
                      onActiveStartDateChange={handleCalendarMonthChange}
                      tileClassName={setDateClassName}
                      className="calendarCSS"
                    />

                    </div>
                  </div>

                  <div className="col-span-4 rounded-[20px]">
                    <div style={{"border":"1px none silver", marginLeft:"20px", height:"auto"}}>
                      <div className="flex" style={{alignItems:"center"}}>
                          <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                            <rect width="15" height="15" fill="lightblue" />
                          </svg> <span>{t('Present')} ({attendanceCounts.P} {t('Days')})</span>
                      </div>
                      <div className="flex" style={{alignItems:"center"}}>
                          <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                            <rect width="15" height="15" fill="red" />
                          </svg> <span>{t('Absent')} ({attendanceCounts.A} {t('Days')})</span>
                      </div>
                      <div className="flex" style={{alignItems:"center"}}>
                          <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                            <rect width="15" height="15" fill="yellow" />
                          </svg> <span>{t('Leave')} ({attendanceCounts.L} {t('Days')})</span>
                      </div>
                      <div className="flex" style={{alignItems:"center"}}>
                          <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                            <rect width="15" height="15" fill="orange" />
                          </svg> <span>{t('Leave WO Pay')} ({attendanceCounts.LWP} {t('Days')})</span>
                      </div>
                      <div className="flex" style={{alignItems:"center"}}>
                          <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                            <rect width="15" height="15" fill="lightgreen" />
                          </svg> <span>{t('WeekOff')} ({attendanceCounts.WO} {t('Days')})</span>
                      </div>
                      <div className="flex" style={{alignItems:"center"}}>
                          <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                            <rect width="15" height="15" fill="green" />
                          </svg> <span>{t('Holiday')} ({attendanceCounts.FD} {t('Days')})</span>
                      </div>
                      {/* <div className="flex" style={{alignItems:"center"}}>
                          <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                            <rect width="15" height="15" fill="violet" />
                          </svg> <span>{t('Half Day Holiday')} ({attendanceCounts.HD} {t('Days')})</span>
                      </div> */}
                      <div className="flex" style={{alignItems:"center"}}>
                          <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                            <rect width="15" height="15" fill="violet" />
                          </svg> <span>{t('Half Day Holiday (P)')} ({(attendanceCounts.HHP/2)} {t('Days')})</span>
                      </div>
                      <div className="flex" style={{alignItems:"center"}}>
                          <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                            <rect width="15" height="15" fill="Brown" />
                          </svg> <span>{t('Half Day Holiday (A)')} ({(attendanceCounts.HHA/2)} {t('Days')})</span>
                      </div>
                      <div className="flex" style={{alignItems:"center", marginTop:"30px"}}>
                          <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                            <rect width="15" height="15" fill="white" stroke="Black" strokeWidth="1" />
                          </svg> <span style={{fontWeight:"bold"}}> {t('-NA-')} ({(TotalDays-(attendanceCounts.P + attendanceCounts.L + attendanceCounts.WO + attendanceCounts.FD + (attendanceCounts.HHP/2))-(attendanceCounts.HHA/2))} {t('Days')})</span>
                      </div>
                      <div className="flex" style={{alignItems:"center"}}>
                          <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                            <rect width="15" height="15" fill="blueviolet" />
                          </svg> <span style={{fontWeight:"bold"}}>{t('Paid Days')} = {attendanceCounts.P + attendanceCounts.L + attendanceCounts.WO + attendanceCounts.FD + (attendanceCounts.HHP/2) + (attendanceCounts.HHA/2)} {t('Days')}</span>
                      </div>
                      <div className="flex" style={{alignItems:"center"}}>
                          <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                            <rect width="15" height="15" fill="silver" />
                          </svg> <span style={{fontWeight:"bold"}}>{t('Total Days')} = {TotalDays}</span>
                      </div>
                      
                    </div>
                  </div>
                </div>
              </Card>
  );
};

export default EmpAttendCalendar;
