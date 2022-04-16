/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable radix */
/* eslint-disable no-restricted-syntax */
import { transaction } from '../adapters/index';

var GBranch = '';

function WhereClauseBranch(PwhereClause) {

  let NewwhereClause;

  NewwhereClause = PwhereClause;

  if (GBranch === 'All') {
    return NewwhereClause;
  }

  if (NewwhereClause != '') {

    NewwhereClause += ` and branch ='${GBranch}'`

  }
  else {

    NewwhereClause += ` where  branch ='${GBranch}'`
  }

  return NewwhereClause;

}

function YearlyRevenueQuery(dateCol, amountCol, tableName, whereClause = '') {

  whereClause = WhereClauseBranch(whereClause);

  const queryText = `SELECT
        CASE WHEN extract(month from ${dateCol})>=4 THEN
              concat(extract (year from ${dateCol}), '-', extract (year from ${dateCol})+1)
        ELSE concat(extract(year from ${dateCol})-1,'-', extract (year from ${dateCol})) END AS labelName,
        sum(CAST(${amountCol} AS NUMERIC)) as dataVal
        FROM ${tableName} r2 ${whereClause} GROUP BY labelName `;
  return queryText;
}

function HalfYearlyRevenueQuery(
  dateCol,
  amountCol,
  tableName,
  whereClause = '',
) {
  whereClause = WhereClauseBranch(whereClause);
  const queryText = `SELECT
        CASE WHEN extract(month from ${dateCol})>=4 and extract(month from ${dateCol})<=9 THEN
        concat('APR ',extract (year from ${dateCol}), '-', 'SEP ',extract (year from ${dateCol}))
      WHEN extract(month from ${dateCol})>9 and extract(month from ${dateCol})<=12 THEN
        concat('OCT ',extract (year from ${dateCol}), '-', 'MAR ',extract (year from ${dateCol})+1)
        ELSE concat('OCT ', extract(year from ${dateCol})-1,'-', 'MAR ',extract (year from ${dateCol}))   END AS labelName,
        sum(CAST(${amountCol} AS NUMERIC)) as dataVal
      FROM ${tableName} r2 ${whereClause} GROUP BY labelName `;

  //console.log(queryText);
  return queryText;
}

function QuaterlyRevenueQuery(dateCol, amountCol, tableName, whereClause = '') {
  whereClause = WhereClauseBranch(whereClause);
  const queryText = `SELECT
  CASE WHEN extract(month from ${dateCol})>=4 and extract(month from ${dateCol})<=6 THEN
        concat('APR ',to_char(${dateCol},'yy'), '-', 'JUN ',to_char(${dateCol},'yy'))
      WHEN extract(month from ${dateCol})>=7 and extract(month from ${dateCol})<=9 THEN
        concat('JUL ',to_char(${dateCol},'yy'), '-', 'SEP ',to_char(${dateCol},'yy'))
      WHEN extract(month from ${dateCol})>=10 and extract(month from ${dateCol})<=12 THEN
        concat('OCT ',to_char(${dateCol},'yy'), '-', 'DEC ',to_char(${dateCol},'yy'))
  ELSE concat('JAN ', to_char(${dateCol},'yy'),'-', 'MAR ',to_char(${dateCol},'yy'))  END AS labelName,
  sum(CAST(${amountCol} AS NUMERIC)) as dataVal
FROM ${tableName} r2 ${whereClause} GROUP BY labelName `;
  return queryText;
}

function CurrentQuarterGrossRevenue() {
  const queryText = `select labelName, dataVal from
  (
  select   sum(CAST(commission AS NUMERIC)) as dataVal,vertical as labelName,
    to_char(date_trunc('quarter', month_year )::date, 'yyyy-q') as quarter
  from
    revenue
  group by
    vertical,
    quarter
  order by
    quarter asc
   ) as r
   where r.quarter = to_char(date_trunc('quarter', current_date )::date, 'yyyy-q')`;
  return queryText;
}

function CurrentYearGrossRevenue() {
  const queryText = `select dataVal, labelName
  from
  (
  SELECT
    CASE WHEN extract(month from month_year)>=4 THEN
           concat(extract (year from month_year), '-', extract (year from month_year)+1)
    ELSE concat(extract(year from month_year)-1,'-', extract (year from month_year)) END AS financial_year,
    CASE WHEN extract(month from current_date)>=4 THEN
           concat(extract (year from current_date), '-', extract (year from current_date)+1)
    ELSE concat(extract(year from current_date)-1,'-', extract (year from current_date)) END AS currentfinancial_year,
    SUM(CAST(commission AS NUMERIC)) as dataVal, vertical as LabelName
 FROM revenue r2
 GROUP BY financial_year , vertical
 ) as r
 where r.financial_year = r.currentfinancial_year`;
  return queryText;
}

function CurrentHalfYearlyGrossRevenue() {
  const queryText = `select dataVal, labelName
  from
  (
 SELECT
    CASE
        WHEN extract(month from month_year)>=4 and extract(month from month_year)<=9 THEN
           concat('APR ',extract (year from month_year), '-', 'SEP ',extract (year from month_year))
        WHEN extract(month from month_year)>9 and extract(month from month_year)<=12 THEN
           concat('OCT ',extract (year from month_year), '-', 'MAR ',extract (year from month_year)+1)
    ELSE
          concat('OCT ', extract(year from month_year)-1,'-', 'MAR ',extract (year from month_year))
    END AS financial_year,
    CASE
        WHEN extract(month from current_date)>=4 and extract(month from current_date)<=9 THEN
           concat('APR ',extract (year from current_date), '-', 'SEP ',extract (year from current_date))
        WHEN extract(month from current_date)>9 and extract(month from current_date)<=12 THEN
           concat('OCT ',extract (year from current_date), '-', 'MAR ',extract (year from current_date)+1)
    ELSE
          concat('OCT ', extract(year from current_date)-1,'-', 'MAR ',extract (year from current_date))
    END AS currentfinancial_year,
    SUM(CAST(commission AS NUMERIC)) as dataVal, vertical as LabelName
 FROM revenue r2
 GROUP BY financial_year, vertical
 ) as r
 where r.financial_year = r.currentfinancial_year`;
  return queryText;
}
async function GrossRevenuePercentageBarData(Period, Branch) {
  const revAmountCol = 'net_commission';
  const revDateCol = 'month_year';
  const revTableName = 'revenue';

  const expenseAmountCol = 'expense_amount';
  const expenseDateCol = 'expense_date';
  const expenseTableName = 'expenses';

  let queryText = '';
  let data = '';

  if (Period === 'Yearly') {
    queryText = `select r.labelName,  ((coalesce(nullif(e.dataVal, 0),0))/(r.dataVal) *100) as dataVal
                    from (${YearlyRevenueQuery(
      revDateCol,
      revAmountCol,
      revTableName,

    )}) as r
                    left OUTER JOIN
                    (${YearlyRevenueQuery(
      expenseDateCol,
      expenseAmountCol,
      expenseTableName,
    )}) as e
                    on r.labelName = e.labelName`;
  } else if (Period === 'Quarterly') {
    queryText = `select r.labelName,  ((coalesce(nullif(e.dataVal, 0),0))/(r.dataVal) *100) as dataVal
                    from (${QuaterlyRevenueQuery(
      revDateCol,
      revAmountCol,
      revTableName,
    )}) as r
                    left OUTER JOIN
                    (${QuaterlyRevenueQuery(
      expenseDateCol,
      expenseAmountCol,
      expenseTableName,
    )}) as e
                    on r.labelName = e.labelName`;
  } else if (Period === 'HalfYearly') {
    queryText = `select r.labelName,  ((coalesce(nullif(e.dataVal, 0),0))/(r.dataVal) *100) as dataVal
                    from (${HalfYearlyRevenueQuery(
      revDateCol,
      revAmountCol,
      revTableName,
    )}) as r
                    left OUTER JOIN
                    (${HalfYearlyRevenueQuery(
      expenseDateCol,
      expenseAmountCol,
      expenseTableName,
    )}) as e
                    on r.labelName = e.labelName`;
  } else if (Period === 'Monthly') {
    let whereClause = '';
    whereClause = WhereClauseBranch('');
    queryText = `SELECT r.my as labelName, ((coalesce(nullif(e.eamount, 0),0))/(r.amount) *100) as dataVal
    FROM (select to_char(month_year,'MON-YY') as my, sum (CAST(net_commission AS NUMERIC)) as amount from revenue ${whereClause} group by my) as r
    left OUTER JOIN
    (select sum(CAST(expense_amount AS NUMERIC)) as eamount, to_char(expense_date,'MON-YY') as edate from expenses ${whereClause} group by expense_date) as e
    on r.my=e.edate order by to_date(concat('01-',r.my),'DD-MON-YYYY') asc`;
  }
  data = await transaction(queryText);
  const sortedData = SortData(Period, data.rows);
  return sortedData;
}
async function ProcessNetRevenuePieData(Period, Branch) {
  let queryText = '';
  let data = '';
  if (Period === 'Monthly') {
    queryText = `select vertical  as labelName, sum(CAST(commission AS NUMERIC)) as dataVal from revenue
    where to_char(month_year,'MON-yyyy') = to_char(current_date,'MON-yyyy')
    group by to_char(month_year,'MON-yyyy'), vertical`;
  } else if (Period === 'Yearly') {
    queryText = CurrentYearGrossRevenue();
  } else if (Period === 'Quarterly') {
    queryText = CurrentQuarterGrossRevenue();
  } else if (Period === 'HalfYearly') {
    queryText = CurrentHalfYearlyGrossRevenue();
  }
  data = await transaction(queryText);

  let totalrev = 0.0;
  for (let i = 0; i < data.rows.length; i++) {
    totalrev += parseFloat(data.rows[i].dataval);
  }

  for (let i = 0; i < data.rows.length; i++) {
    const val = parseFloat(data.rows[i].dataval);
    const perc = Math.round(100 * (val / totalrev));
    data.rows[i].dataval = String(perc);
  }
  return data.rows;
}

function SortData(Period, data) {
  if (Period === 'Monthly') {
    data.sort((a, b) => {
      const months = {
        jan: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        may: 4,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        oct: 9,
        nov: 10,
        dec: 11,
      };
      const curryear = '20';

      const x = a.labelname;
      const month1 = x.substring(0, 3);
      const year1 = x.substring(4, 6);
      const calcYear1 = parseInt(curryear.concat(year1));
      const date1 = new Date(calcYear1, months[month1.toLowerCase()], 1);

      const y = b.labelname;
      const month2 = y.substring(0, 3);
      const year2 = y.substring(4, 6);
      const calcYear2 = parseInt(curryear.concat(year2));
      const date2 = new Date(calcYear2, months[month2.toLowerCase()], 1);
      return date1 - date2;
    });

    const slicedData = data.slice(0).slice(-24);
    return slicedData;
  }
  if (Period === 'Yearly') {
    data.sort((a, b) => {
      const x = a.labelname;
      const year1 = parseInt(x.substring(5, 9));
      const y = b.labelname;
      const year2 = parseInt(y.substring(5, 9));
      return year1 - year2;
    });

    const slicedData = data.slice(0).slice(-12);
    return slicedData;
  } if (Period === 'Quarterly') {
    data.sort((a, b) => {
      const months = {
        jan: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        may: 4,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        oct: 9,
        nov: 10,
        dec: 11,
      };
      const curryear = '20';

      const x = a.labelname;
      const quarter1 = x.substring(7, 13);
      const month1 = quarter1.substring(0, 3);
      const year1 = quarter1.substring(4, 6);
      const calcYear1 = parseInt(curryear.concat(year1));
      const date1 = new Date(calcYear1, months[month1.toLowerCase()], 1);

      const y = b.labelname;
      const quarter2 = y.substring(7, 13);
      const month2 = quarter2.substring(0, 3);
      const year2 = quarter2.substring(4, 6);
      const calcYear2 = parseInt(curryear.concat(year2));
      const date2 = new Date(calcYear2, months[month2.toLowerCase()], 1);
      return date1 - date2;
    });

    const slicedData = data.slice(0).slice(-24);
    return slicedData;
  } if (Period === 'HalfYearly') {
    data.sort((a, b) => {
      const months = {
        jan: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        may: 4,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        oct: 9,
        nov: 10,
        dec: 11,
      };

      const x = a.labelname;
      const quarter1 = x.substring(9, 17);
      const month1 = quarter1.substring(0, 3);
      const year1 = quarter1.substring(4, 8);
      const calcYear1 = parseInt(year1);
      const date1 = new Date(calcYear1, months[month1.toLowerCase()], 1);

      const y = b.labelname;
      const quarter2 = y.substring(9, 17);
      const month2 = quarter2.substring(0, 3);
      const year2 = quarter2.substring(4, 8);
      const calcYear2 = parseInt(year2);
      const date2 = new Date(calcYear2, months[month2.toLowerCase()], 1);
      return date1 - date2;
    });

    const slicedData = data.slice(0).slice(-12);
    return slicedData;
  }
}
async function ProcessNetRevenueBarData(Period, Branch) {
  const revAmountCol = 'net_commission';
  const revDateCol = 'month_year';
  const revTableName = 'revenue';

  const expenseAmountCol = 'expense_amount';
  const expenseDateCol = 'expense_date';
  const expenseTableName = 'expenses';

  let queryText = '';
  let data = '';

  if (Period === 'Yearly') {
    queryText = `select r.labelName, (r.dataVal - coalesce(nullif(e.dataVal, 0),0)) AS dataVal
                    from (${YearlyRevenueQuery(
      revDateCol,
      revAmountCol,
      revTableName,

    )}) as r
                    left OUTER JOIN
                    (${YearlyRevenueQuery(
      expenseDateCol,
      expenseAmountCol,
      expenseTableName,
    )}) as e
                    on r.labelName = e.labelName`;
  } else if (Period === 'Quarterly') {
    queryText = `select r.labelName, (r.dataVal - coalesce(nullif(e.dataVal, 0),0)) AS dataVal
                    from (${QuaterlyRevenueQuery(
      revDateCol,
      revAmountCol,
      revTableName,
    )}) as r
                    left OUTER JOIN
                    (${QuaterlyRevenueQuery(
      expenseDateCol,
      expenseAmountCol,
      expenseTableName,
    )}) as e
                    on r.labelName = e.labelName`;
  } else if (Period === 'HalfYearly') {
    queryText = `select r.labelName, (r.dataVal - coalesce(nullif(e.dataVal, 0),0)) AS dataVal
                    from (${HalfYearlyRevenueQuery(
      revDateCol,
      revAmountCol,
      revTableName,
    )}) as r
                    left OUTER JOIN
                    (${HalfYearlyRevenueQuery(
      expenseDateCol,
      expenseAmountCol,
      expenseTableName,
    )}) as e
                    on r.labelName = e.labelName`;
  } else if (Period === 'Monthly') {
    let whereClause = '';
    whereClause = WhereClauseBranch('');
    queryText = `SELECT r.my as labelName, (r.amount - coalesce(nullif(e.eamount, 0),0)) as dataVal
    FROM (select to_char(month_year,'MON-YY') as my, sum (CAST(net_commission AS NUMERIC)) as amount from revenue ${whereClause} group by my) as r
    left OUTER JOIN
    (select sum(CAST(expense_amount AS NUMERIC)) as eamount, to_char(expense_date,'MON-YY') as edate from expenses ${whereClause} group by expense_date) as e
    on r.my=e.edate order by to_date(concat('01-',r.my),'DD-MON-YYYY') asc`;
  }
  data = await transaction(queryText);
  const sortedData = SortData(Period, data.rows);
  return sortedData;
}

async function ProcessGrossRevenueAndExpenseData(
  DataType,
  Period,
  VerticalName,
  Branch
) {
  let queryText = '';
  let data = '';
  let amountCol = '';
  let dateCol = '';
  let tableName = '';
  let whereClause = '';

  if (DataType === 'AUMLineData') {
    amountCol = 'aum';
    dateCol = 'date';
    tableName = 'aum';
    whereClause = '';
    VerticalName = '';
  } else if (DataType === 'ExpenseLineData') {
    amountCol = 'expense_amount';
    dateCol = 'expense_date';
    tableName = 'expenses';
    whereClause = '';
    VerticalName = '';
  } else {
    amountCol = 'net_commission';
    dateCol = 'month_year';
    tableName = 'revenue';
    whereClause = 'where vertical = $1';
  }

  if (Period === 'Yearly') {
    if (VerticalName === 'All' || VerticalName === '') {
      data = await transaction(
        YearlyRevenueQuery(dateCol, amountCol, tableName, ''),
      );
    } else {
      data = await transaction(
        YearlyRevenueQuery(dateCol, amountCol, tableName, whereClause),
        [VerticalName],
      );
    }
  } else if (Period === 'Quarterly') {
    if (VerticalName === 'All' || VerticalName === '') {
      data = await transaction(
        QuaterlyRevenueQuery(dateCol, amountCol, tableName, ''),
      );
    } else {
      data = await transaction(
        QuaterlyRevenueQuery(dateCol, amountCol, tableName, whereClause),
        [VerticalName],
      );
    }
  } else if (Period === 'HalfYearly') {
    if (VerticalName === 'All' || VerticalName === '') {
      data = await transaction(
        HalfYearlyRevenueQuery(dateCol, amountCol, tableName, ''),
      );
    } else {
      data = await transaction(
        HalfYearlyRevenueQuery(dateCol, amountCol, tableName, whereClause),
        [VerticalName],
      );
    }
  } else if (Period === 'Monthly') {
    whereClause = WhereClauseBranch(whereClause);
    if (VerticalName === 'All' || VerticalName === '') {

      if (Branch === 'All') {
        queryText = `select to_char(${dateCol},'MON-yy') as labelName , sum(CAST(${amountCol} AS NUMERIC)) as dataVal from ${tableName} r2 group by to_char(${dateCol},'MON-yy')`;
      }
      else {
        whereClause = WhereClauseBranch('');
        queryText = `select to_char(${dateCol},'MON-yy') as labelName ,  sum(CAST(${amountCol} AS NUMERIC)) as dataVal from ${tableName} r2 ${whereClause} group by to_char(${dateCol},'MON-yy')`;
      }
      data = await transaction(queryText);
    }
    else {
      queryText = `select to_char(${dateCol},'MON-yy') as labelName ,  sum(CAST(${amountCol} AS NUMERIC)) as dataVal from ${tableName} r2 ${whereClause} group by to_char(${dateCol},'MON-yy')`;
      data = await transaction(queryText, [VerticalName]);
    }
    data.rows.reverse();
  }

  const sortedData = SortData(Period, data.rows);
  return sortedData;
}

async function ProcessAUMSIPData(DataType, Period, Branch) {
  let amountCol = '';
  const dateCol = 'date';
  const tableName = 'aum';
  let queryText = '';
  let data = '';
  let whereClause = '';


  if (DataType === 'AUMLineData') {
    amountCol = 'aum';
  } else if (DataType === 'SIPLineData') {
    amountCol = 'sip';
  }

  if (Branch === 'All') {
    queryText = `select to_char(${dateCol},'MON-yy') as labelName ,  sum(CAST(${amountCol} AS NUMERIC)) as dataVal from ${tableName} r2 group by ${dateCol}  order by ${dateCol}`;
    data = await transaction(queryText);
  }
  else {
    whereClause += ` where branch ='${Branch}'`
    queryText = `select to_char(${dateCol},'MON-yy') as labelName ,  sum(CAST(${amountCol} AS NUMERIC)) as dataVal from ${tableName} r2 ${whereClause} group by ${dateCol}  order by ${dateCol}`;
    data = await transaction(queryText);
  }
  /*
    const queryText = `select to_char(${dateCol},'MON-yy') as labelName ,  sum(CAST(${amountCol} AS NUMERIC)) as dataVal from ${tableName} r2 group by ${dateCol}  order by ${dateCol}`;
    const data = await transaction(queryText);
  */


  let tempdata = [];
  if (Period === 'Yearly') {
    for (const row in data.rows) {
      if (data.rows[row].labelname.indexOf('MAR-', 0) !== -1) {
        tempdata.push(data.rows[row]);
      }
    }
  } else if (Period === 'HalfYearly') {
    for (const row in data.rows) {
      if (
        data.rows[row].labelname.indexOf('MAR-', 0) !== -1 ||
        data.rows[row].labelname.indexOf('SEP-', 0) !== -1
      ) {
        tempdata.push(data.rows[row]);
      }
    }
  } else if (Period === 'Quarterly') {
    for (const row in data.rows) {
      if (
        data.rows[row].labelname.indexOf('JUN-', 0) !== -1 ||
        data.rows[row].labelname.indexOf('SEP-', 0) !== -1 ||
        data.rows[row].labelname.indexOf('DEC-', 0) !== -1 ||
        data.rows[row].labelname.indexOf('MAR-', 0) !== -1
      ) {
        tempdata.push(data.rows[row]);
      }
    }
  } else {
    tempdata = data.rows;
  }

  const sortedData = SortData('Monthly', tempdata);
  return sortedData;
}

async function getData({ filterValue }) {
  const filterval = JSON.parse(filterValue);

  const VerticalName = filterval.selectedVertical;
  const Period = filterval.selectedValue;
  const DataType = filterval.data_type;
  const Branch = filterval.selectedBranch;
  GBranch = filterval.selectedBranch;

  if (DataType === 'NetRevenuPieData') {
    return ProcessNetRevenuePieData(Period, Branch);
  }
  if (DataType === 'GrossRevenuePercentageBarData') {
    return GrossRevenuePercentageBarData(Period, Branch);
  }
  if (DataType === 'NetRevenueBarData') {
    return ProcessNetRevenueBarData(Period, Branch);
  }
  if (DataType === 'AUMLineData' || DataType === 'SIPLineData') {
    return ProcessAUMSIPData(DataType, Period, Branch);
  }
  return ProcessGrossRevenueAndExpenseData(DataType, Period, VerticalName, Branch);
}

export default async function (request) {
  switch (request.method) {
    case 'GET':
      return getData(request.query);

    default:
      return { Error: 'Not Supported Action' };
  }
}
