/**
 *  获取今天的日期  yyyy-dd-mm
 * @return string    yyyy-dd-mm
 */
export function getTodayDate() {
    let times = new Date();
    let yy = times.getFullYear();
    let mm = (times.getMonth() + 1) < 10 ? '0' + (times.getMonth() + 1) : times.getMonth() + 1;
    let dd = times.getDate() < 10 ? '0' + times.getDate() : times.getDate();
    let dates = yy + '-' + mm + '-' + dd;
    return dates;
}

/**
*  获取当前月份  yyyy-dd
* @return string    yyyy-dd
*/
export function getCurrentMouth() {
    let times = new Date();
    let yy = times.getFullYear();
    let mm = (times.getMonth() + 1) < 10 ? '0' + (times.getMonth() + 1) : times.getMonth() + 1;
    // let dd = times.getDate() < 10 ? '0' + times.getDate() : times.getDate();
    let dates = yy + '-' + mm;
    return dates;
}
/**
 *  获取下一个月份  yyyy-dd
 * @return string    yyyy-dd
 */
export function getLastMouth() {
    let times = new Date();
    let yy = times.getFullYear();
    let mm = (times.getMonth() + 2) < 10 ? '0' + (times.getMonth() + 2) : times.getMonth() + 2;
    // let dd = times.getDate() < 10 ? '0' + times.getDate() : times.getDate();
    let dates = yy + '-' + mm;
    return dates;
}

/**
 * 获取上个月的日期  yyyy-dd-mm  默认30天
 * @param date    传入的时间格式是 yyyy-dd-mm
 * @return string    yyyy-dd-mm
 */
export function getPreMonth(date) {
    let arr = date.split('-');
    let year = arr[0]; //获取当前日期的年份  
    let month = arr[1]; //获取当前日期的月份  
    let day = arr[2]; //获取当前日期的日  
    let year2 = year;
    let month2 = parseInt(month) - 1;
    if (month2 == 0) {
        year2 = parseInt(year2) - 1;
        month2 = 12;
    }
    let day2 = day;
    let days2 = new Date(year2, month2, 0);
    days2 = days2.getDate();
    if (day2 > days2) {
        day2 = days2;
    }
    if (month2 < 10) {
        month2 = '0' + month2;
    }
    let t2 = year2 + '-' + month2 + '-' + day2;
    return t2;
}
// 获取相差的天数  GetDateStr(-1)前一天
export function GetDateStr(AddDayCount) {
    let dd = new Date();
    dd.setDate(dd.getDate() + AddDayCount); //获取AddDayCount天后的日期
    let y = dd.getFullYear();
    let m = (dd.getMonth() + 1) < 10 ? "0" + (dd.getMonth() + 1) : (dd.getMonth() + 1); //获取当前月份的日期，不足10补0
    let d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate(); //获取当前几号，不足10补0
    return y + "-" + m + "-" + d;
}
// 格式化 formatDate('y-m-d h:i:s',new Date())  返回 2021-03-30 09:19:31
export function formatDate(formatStr, fdate) {
    let fTime, fStr = 'ymdhis';
    if (!formatStr)
        formatStr = "y-m-d h:i:s";
    if (fdate)
        fTime = new Date(fdate);
    else
        fTime = new Date();
    let formatArr = [
        fTime.getFullYear().toString(),
        ((fTime.getMonth() + 1) < 10 ? '0' + (fTime.getMonth() + 1) : (fTime.getMonth() + 1)).toString(),
        (fTime.getDate() < 10 ? "0" + fTime.getDate() : fTime.getDate()).toString(),
        (fTime.getHours() < 10 ? "0" + fTime.getHours() : fTime.getHours()).toString(),
        (fTime.getMinutes() < 10 ? "0" + fTime.getMinutes() : fTime.getMinutes()).toString(),
        (fTime.getSeconds() < 10 ? "0" + fTime.getSeconds() : fTime.getSeconds()).toString()
    ];
    for (let i = 0; i < formatArr.length; i++) {
        formatStr = formatStr.replace(fStr.charAt(i), formatArr[i]);
    }
    return formatStr
}
//  时间戳转 年月日时分秒
export function formatDate1(timestamp) {
    let date = new Date(timestamp);
    let year = date.getFullYear();
    let month = addZero(date.getMonth() + 1);
    let day = addZero(date.getDate());
    let hours = addZero(date.getHours());
    let minutes = addZero(date.getMinutes());
    let seconds = addZero(date.getSeconds());
    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
}
function addZero(num) {
    return num < 10 ? '0' + num : num;
}

// 根据指定的日期获取星期  weekDay("2022-02-22")
export function weekDay(date) {
    if (!date) return ""
    let dt = new Date(date.split("-")[0], date.split("-")[1] - 1, date = date.split("-")[2]);
    let weekDay = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    return weekDay[dt.getDay()];
}
/**
 * date 代表指定的日期，格式：2021-07-29
 * day 传-1表始前一天，传1表始后一天
 * eg:  getTargetDate('2021-07-29',-1) 前一天
*/
export function getTargetDate(date, day) {
    let dd = new Date(date);
    dd.setDate(dd.getDate() + day);
    let y = dd.getFullYear();
    let m = dd.getMonth() + 1 < 10 ? "0" + (dd.getMonth() + 1) : dd.getMonth() + 1;
    let d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();
    return y + "-" + m + "-" + d;
}
/**
* date 代表指定的日期，格式：20210729
* eg:  getFormatDate('20210729') 前一天  2021-07-29
*/
export function getFormatDate(date, type = "-") {
    if (!date) return ""
    if (type === "-") {
        let y = date.slice(0, 4)
        let m = date.slice(4, 6);
        let d = date.slice(6, 8);
        return y + "-" + m + "-" + d;
    } else {
        let y = date.slice(0, 4)
        let m = Number(date.slice(4, 6));
        let d = Number(date.slice(6, 8));
        return y + "年" + m + "月" + d + "日";
    }
}

// 获取当前日期所在的周 及往前推11个周的数据  广告库存相关页面
export function twelveWeeks() {
    let times = new Date();
    let yy = times.getFullYear();
    let mm = (times.getMonth() + 1) < 10 ? '0' + (times.getMonth() + 1) : times.getMonth() + 1;
    let dd = times.getDate() < 10 ? '0' + times.getDate() : times.getDate();
    let week = times.getDay()
    let todayDate = yy + '-' + mm + '-' + dd;
    let startDate = new Date(times.getTime() - 3600 * 1000 * 24 * (77 + week - 1))
    let yy1 = startDate.getFullYear();
    let mm1 = (startDate.getMonth() + 1) < 10 ? '0' + (startDate.getMonth() + 1) : startDate.getMonth() + 1;
    let dd1 = startDate.getDate() < 10 ? '0' + startDate.getDate() : startDate.getDate();
    let start = yy1 + '-' + mm1 + '-' + dd1;
    return [start, todayDate]
}
// 当前日期  往前推 11个月 获取12月的日期  广告库存相关页面
export function twelveMonths() {
    let times = new Date();
    let yy = times.getFullYear();
    let mm = (times.getMonth() + 1) < 10 ? '0' + (times.getMonth() + 1) : times.getMonth() + 1;
    let dd = times.getDate() < 10 ? '0' + times.getDate() : times.getDate();
    let todayDate = yy + '-' + mm + '-' + dd;
    let start;
    if (mm === 12) {
        start = yy + "-01-01"
    } else {
        let prev = (times.getMonth() + 2) < 10 ? '0' + (times.getMonth() + 2) : times.getMonth() + 2;
        start = `${yy - 1}-${prev}-01`
    }
    return [start, todayDate]
}
// 获取上三个月 2021-02
export function prevThreeMonths() {
    let times = new Date();
    let yy = times.getFullYear();
    let mm = (times.getMonth() + 1) < 10 ? '0' + (times.getMonth() + 1) : times.getMonth() + 1;
    let start;
    if (mm === 1 || mm === 2 || mm === 3) {
        start = `${yy - 1} + ${mm + 10}`
    } else {
        let prev = (times.getMonth() - 2) < 10 ? '0' + (times.getMonth() - 2) : times.getMonth() - 2;
        start = `${yy}-${prev}`
    }
    return start
}
// 获取上两个月 2021-02
export function prevSecondMonths() {
    let times = new Date();
    let yy = times.getFullYear();
    let mm = (times.getMonth() + 1) < 10 ? '0' + (times.getMonth() + 1) : times.getMonth() + 1;
    let start;
    if (mm === 1 || mm === 2) {
        start = `${yy - 1} + ${mm + 10}`
    } else {
        let prev = (times.getMonth() - 1) < 10 ? '0' + (times.getMonth() - 1) : times.getMonth() - 1;
        start = `${yy}-${prev}`
    }
    return start
}
// 获取上个月 2021-02
export function prevMonth() {
    let times = new Date();
    let yy = times.getFullYear();
    let mm = times.getMonth() + 1;
    let start;
    if (mm === 1) {
        start = `${yy - 1}-${mm + 11}`
    } else {
        let prev = times.getMonth() < 10 ? '0' + times.getMonth() : times.getMonth();
        start = `${yy}-${prev}`
    }
    return start
}
// 获取指定日期的 上个月最后一天 eg: 2021-12-23  return 2021-11-30  or 2021-01-23  return 2020-12-31
export function prevMonthLastDay(whichDay) {
    let year = whichDay.split("-")[0]
    let month = whichDay.split("-")[1]
    let num = parseInt(month)
    if (num == 1) {
        month = 12;
        year = year - 1;
    } else {
        month = (num - 1) < 10 ? "0" + (num - 1) : num - 1
    }
    let lastDay = new Date(year, month, 0);
    return year + "-" + month + "-" + lastDay.getDate();//上个月的最后一天
}
//  取指定月份的起始日期以及结束日期 输入2024-01 返回  ['2024-01-01','2024-01-31']
export function getMonthRange(dateStr) {
    const [year, month] = dateStr.split('-');
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const startDay = startDate.getDate().toString().padStart(2, '0');
    const endDay = endDate.getDate().toString().padStart(2, '0');

    const startDateStr = `${year}-${month}-${startDay}`;
    const endDateStr = `${year}-${month}-${endDay}`;

    return [startDateStr, endDateStr];
}

// 小数转化为百分数 point原数据 length保留小数位  四舍五入
export function toPercent(point, length = 1, flag = false) {
    if (point === null || point === undefined || point === "") return "";
    if (Number(point) === 0) return 0;
    let num = ""
    if (flag) {
        num = Number(point).toFixed(length)
    } else {
        num = Number(point * 100).toFixed(length)
    }
    return num + "%"
}

// 本周current 上周prevOne 上上周prevTwo 上上上周prevThree
export function getWeekList(date, type, fmt) {
    let arr = []
    // 格式化日期
    const dateFormat = (date, fmt) => {
        let y = date.getFullYear() // 年
        let m = date.getMonth() + 1 // 月
        m = m > 10 ? m : '0' + m
        let d = date.getDate() // 日
        d = d > 10 ? d : '0' + d
        return `${y}${fmt}${m}${fmt}${d}`
    }

    let currentDate = new Date(date)
    let w = currentDate.getDay() // 当前星期 0-6
    let y = currentDate.getFullYear() // 当前年
    let m = currentDate.getMonth() + 1 // 当前月
    let d = currentDate.getDate() // 当前日期
    if (w === 0) w = 7
    // 先算出周一是几号 根据type类型计算
    let Monday = 0
    // 获取周一的年份 月份 日期
    const getMonday = (zf) => {
        if (zf <= 0) {
            // 日期小于0 且当前星期不是0
            if (m - 1 <= 0) {
                // 月份<=0 年份-1
                y = y - 1 // 年份 -1
                m = 12 // 月份 = 12
                let n = d - (w - 1) // 负的星期
                Monday = new Date(y, m, 0).getDate() + n
                // console.log(y, m, Monday)
            } else {
                m = m - 1 // 月份 -1
                let n = d - (w - 1) // 负的星期
                Monday = new Date(y, m, 0).getDate() + n
                // console.log(y, m, Monday)
            }
        } else if (zf > 0) {
            // 日期大于0
            Monday = d - (w - 1)
            // console.log(y, m, Monday)
        }
    }
    // 本周一
    switch (type) {
        case "current": // 本周
            break
        case "prevOne": // 上一周
            if (d - 7 < 0) {
                if (m - 1 < 1) {
                    m = 12
                    y = y - 1
                    d = new Date(y, m, 0).getDate() + (d - 7)
                } else {
                    m = m - 1
                    d = new Date(y, m, 0).getDate() + (d - 7)
                }
            } else {
                d = d - 7
            }
            break
        case "prevTwo": // 上一周
            if (d - 14 < 0) {
                if (m - 1 < 1) {
                    m = 12
                    y = y - 1
                    d = new Date(y, m, 0).getDate() + (d - 14)
                } else {
                    m = m - 1
                    d = new Date(y, m, 0).getDate() + (d - 14)
                }
            } else {
                d = d - 14
            }
            break
        case "prevThree": // 上一周
            if (d - 21 < 0) {
                if (m - 1 < 1) {
                    m = 12
                    y = y - 1
                    d = new Date(y, m, 0).getDate() + (d - 21)
                } else {
                    m = m - 1
                    d = new Date(y, m, 0).getDate() + (d - 21)
                }
            } else {
                d = d - 21
            }
            break
        case "next": // 下一周
            if (d + 7 > new Date(y, m, 0).getDate()) {
                if (m + 1 > 12) {
                    m = 1
                    y = y + 1
                    d = d + 7 - new Date(y - 1, 12, 0).getDate() // d + 7 大于 12月的天数多少天 就是几号
                } else {
                    m = m + 1
                    d = d + 7 - new Date(y, m - 1, 0).getDate()
                }
            } else {
                d = d + 7
            }
            break
    }
    getMonday(d - (w - 1)) // 获取周一日期

    // 获取日期
    const getDate = (mon, i) => {
        if (mon + i > new Date(y, m, 0).getDate()) {
            // 大于当月天数
            Monday = -i + 1
            mon = 1
            if (m + 1 > 12) {
                y += 1
                m = 1
            } else {
                m += 1
            }
            // console.log(m, i, "大于当月天数")
            return dateFormat(new Date(`${y}-${m}-${mon}`), fmt)
        }
        // console.log(y, m, mon + i)
        // console.log(dateFormat(new Date(y, m, mon + i, 0), fmt))
        return dateFormat(new Date(`${y}-${m}-${mon + i}`), fmt)
    }
    // currentDate = new Date(y, m, Monday, 0)
    // console.log(currentDate, "currentDate")
    // 往后推7天
    for (let i = 0; i < 7; i++) {
        arr[i] = getDate(Monday, i)
    }
    return arr
}


// 获取前n个月日期至今的时间范围 n为1 返回 ['2023-04-01', '2023-05-15']
export function getPastMonthsDateRange(n) {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - n, 1);
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const startYear = startDate.getFullYear().toString();
    const startMonth = (startDate.getMonth() + 1).toString().padStart(2, '0');
    const startDay = startDate.getDate().toString().padStart(2, '0');

    const endYear = endDate.getFullYear().toString();
    const endMonth = (endDate.getMonth() + 1).toString().padStart(2, '0');
    const endDay = endDate.getDate().toString().padStart(2, '0');

    return [`${startYear}-${startMonth}-${startDay}`, `${endYear}-${endMonth}-${endDay}`];
}
// 比较时间大小 参数一是否大于参数二 2024-02-20  2024-02-18
export function compareDate(date1, date2) {
    return new Date(date1).getTime() > new Date(date2).getTime()
}

