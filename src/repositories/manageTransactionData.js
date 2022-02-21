import db, { transaction } from '../adapters/index';
import csvRead from './csvRead';

const path = require('path');

async function convertParsedRevenueCSVDataToArrays(results) {
  const monthYear = results.map(value => {
    return value.monthYear;
  });
  const vertical = results.map(value => {
    return value.vertical;
  });
  const subVertical = results.map(value => {
    return value.subVertical;
  });
  const vendor = results.map(value => {
    return value.vendor;
  });
  const commission = results.map(value => {
    return value.commission;
  });
  const tds = results.map(value => {
    return value.tds;
  });
  const netCommission = results.map(value => {
    return value.netCommission;
  });
  const remarks = results.map(value => {
    return value.remarks;
  });
  const branch = results.map(value => {
    return value.branch;
  });

  const queryText =
    'SELECT public.upload_revenue_info($1,$2,$3,$4,$5,$6,$7,$8,$9)';
  const result = await transaction(queryText, [
    monthYear,
    vertical,
    subVertical,
    vendor,
    commission,
    tds,
    netCommission,
    remarks,
    branch,
  ]);

  return result;
}

async function uploadData(filename) {
  const uploadfileName = path.join('public', filename);

  return csvRead(uploadfileName, convertParsedRevenueCSVDataToArrays);
}

async function getData({ filterValue }) {
  const params = JSON.parse(filterValue);

  let whereClause = 'where vertical is not null and month_year is not null';

  if (params.Verticals.search('Select')) {
    whereClause += ` and  vertical='${params.Verticals}'`;
    if (params['Sub-Verticals'].search('Select')) {
      whereClause += ` and sub_vertical='${params['Sub-Verticals']}'`;

      if (params.Vendors.search('Select')) {
        whereClause += ` and vendor='${params.Vendors}'`;
      }

    }
  }

  if (params.Branch.search('Select')) {
    whereClause += ` and branch='${params.Branch}'`;
  }

  const data = await db.query(
    `Select  id, to_char( month_year, 'MON-YYYY') as transactiondate, vertical, sub_vertical as "sub-vertical", vendor, commission,
     tds, net_commission as netcommission, remarks, created_date_time as createdatetime,branch from revenue ${whereClause} order
     by transactiondate`,
  );

  return data.rows;
}

async function insertData(params) {
  const {
    transactiondate,
    Verticals,
    Vendors,
    commission,
    tds,
    remarks,
    createdatetime,
    Branch,
  } = params;
  const netcomm = (commission - tds).toFixed(2);

  const queryText =
    'INSERT INTO revenue(month_year, vertical, sub_vertical, vendor,commission, tds, net_commission, remarks, created_date_time,Branch) VALUES ($1, $2, $3, $4, $5, $6,$7,$8, $9,$10)';
  const result = await transaction(queryText, [
    transactiondate,
    Verticals,
    params['Sub-Verticals'],
    Vendors,
    commission,
    tds,
    netcomm,
    remarks,
    createdatetime,
    Branch,
  ]);
  return result;
}

async function updateData(params) {
  const {
    vertical,
    vendor,
    commission,
    tds,
    remarks,
    transactiondate,
    id,
    createdatetime,
    Branch,
  } = params;
  const netcomm = (commission - tds).toFixed(2);
  const queryText = `update revenue set commission=$1, tds=$2, net_commission=$3, remarks=$4, created_date_time=$10, branch_name =$11 where vertical=$5 and sub_vertical=$6 and vendor=$7
                     and to_char(month_year, 'MON-YYYY')=$8 and id=$9`;
  const result = await transaction(queryText, [
    commission,
    tds,
    netcomm,
    remarks,
    vertical,
    params['sub-vertical'],
    vendor,
    transactiondate,
    id,
    createdatetime,
    Branch,
  ]);
  return result;
}

async function deleteData(params) {
  const { vertical, vendor, transactiondate, id } = params;

  const queryText = `delete from  revenue  where vertical=ANY($1) and sub_vertical=ANY($2) and vendor=ANY($3) and to_char(month_year, 'MON-YYYY')=ANY($4) and id=ANY($5)`;
  const result = await transaction(queryText, [
    vertical,
    params['sub-vertical'],
    vendor,
    transactiondate,
    id,
  ]);
  return result;
}

export default async function (request, fileUpload) {
  if (fileUpload) {
    return uploadData(request.body.filename);
  }
  switch (request.method) {
    case 'GET':
      return getData(request.query);
    case 'POST':
      return insertData(request.body);
    case 'PUT':
      return updateData(request.body);
    case 'DELETE':
      return deleteData(request.body);
    default:
      return { Error: 'Not Supported Action' };
  }
}
