/* eslint-disable array-callback-return */
import db, { transaction } from '../adapters/index';
import csvRead from './csvRead';

const path = require('path');

async function convertParsedCSVDataToArrays(results) {
  const clientId = results.map(value => {
    return value.client_id;
  });
  const fullName = results.map(value => {
    return value.name;
  });
  const dob = results.map(value => {
    return value.dob;
  });
  const family = results.map(value => {
    return value.family;
  });
  const gender = results.map(value => {
    return value.gender;
  });
  const nationality = results.map(value => {
    return value.nationality;
  });
  const residentialStatus = results.map(value => {
    return value.residential_status;
  });
  const anniversaryDate = results.map(value => {
    return value.anniversary_date;
  });
  const kycStatus = results.map(value => {
    return value.kyc_status;
  });
  const riskCategory = results.map(value => {
    return value.risk_category;
  });
  const acquistionDate = results.map(value => {
    return value.acquistion_date;
  });
  const country = results.map(value => {
    return value.country;
  });
  const state = results.map(value => {
    return value.state;
  });
  const city = results.map(value => {
    return value.city;
  });
  const pinCode = results.map(value => {
    return value.pin_code;
  });
  const mobileNo = results.map(value => {
    return value.mobile_no;
  });
  const emailId = results.map(value => {
    return value.email_id;
  });
  const panNo = results.map(value => {
    return value.pan_no;
  });
  const address = results.map(value => {
    return value.address;
  });
  const aadharNo = results.map(value => {
    return value.aadhar_no;
  });
  const servicesAvailed = results.map(value => {
    return value.services_availed;
  });

  const queryText =
    'SELECT public.upload_clients($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)';
  const result = await transaction(queryText, [
    clientId,
    fullName,
    dob,
    family,
    gender,
    nationality,
    residentialStatus,
    anniversaryDate,
    kycStatus,
    riskCategory,
    acquistionDate,
    country,
    state,
    city,
    pinCode,
    mobileNo,
    emailId,
    panNo,
    address,
    aadharNo,
    servicesAvailed,
  ]);

  return result;
}

async function uploadData(filename) {
  const uploadfileName = path.join('public', filename);
  return csvRead(uploadfileName, convertParsedCSVDataToArrays);
}

async function getData({ filterValue }) {
  const params = JSON.parse(filterValue);

  let whereClause = 'where full_name is not null';

  if (params && params.Family.search('Select')) {
    whereClause += ` and family='${params.Family}'`;
  }
  if (params['Sub-Verticals'].search('Select')) {
    whereClause += ` and services_availed like '%${params['Sub-Verticals']}%'`;
  }

  const data = await db.query(
    `select  id, full_name as name, to_char(dob, 'YYYY-MM-DD') as dob , family, gender, nationality, residential_status as residentialstatus,
    to_char( anniversary_date, 'YYYY-MM-DD') as anniversarydate, kyc_status as kyc, risk_category as riskcategory,
    to_char( acquistion_date, 'YYYY-MM-DD') as acquisitiondate, country, state, city, pin_code as pincode,
     mobile_no as mobile, email_id as email, pan_no as pan, address, aadhar_no as aadhar, created_date_time as createdatetime,
     services_availed as servicesavailed from clients ${whereClause}`,
  );

  return data.rows;
}

async function insertData(params) {
  const {
    name,
    dob,
    family,
    gender,
    nationality,
    residentialstatus,
    anniversarydate,
    kyc,
    riskcategory,
    acquisitiondate,
    country,
    state,
    city,
    pincode,
    mobile,
    email,
    pan,
    address,
    aadhar,
    servicesavailed,
    createdatetime,
  } = params;

  let services = '';
  servicesavailed.map(data => {
    if (data) services += `${data.value},`;
  });
  services.replace(/,$/, '');
  const queryText = `INSERT INTO clients( full_name,dob,family, gender, nationality, residential_status, anniversary_date, kyc_status,
                     risk_category, acquistion_date, country, state, city, pin_code, mobile_no, email_id, pan_no, address, aadhar_no, services_availed, created_date_time)
                     VALUES ($1, $2, $3, $4, $5, $6 , $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`;
  const result = await transaction(queryText, [
    name,
    dob,
    family,
    gender,
    nationality,
    residentialstatus,
    anniversarydate,
    kyc,
    riskcategory,
    acquisitiondate,
    country,
    state,
    city,
    pincode,
    mobile,
    email,
    pan,
    address,
    aadhar,
    services,
    createdatetime,
  ]);
  return result;
}

async function updateData(params) {
  const {
    dob,
    family,
    gender,
    nationality,
    residentialstatus,
    anniversarydate,
    kyc,
    riskcategory,
    acquisitiondate,
    country,
    state,
    city,
    pincode,
    mobile,
    email,
    pan,
    address,
    servicesavailed,
    id,
    createdatetime,
  } = params;

  let services = '';
  servicesavailed.map(data => {
    if (data) services += `${data.value},`;
  });
  services.replace(/,$/, '');
  const queryText = `update clients set dob=$1, family=$2, gender=$3, nationality=$4,  residential_status=$5, anniversary_date=$6, kyc_status=$7,
                     risk_category=$8, acquistion_date=$9, country=$10, state=$11, city=$12, pin_code=$13, mobile_no=$14, email_id=$15, address=$16,
                     services_availed=$17, created_date_time=$20 where pan_no=$18 and id=$19`;
  const result = await transaction(queryText, [
    dob,
    family,
    gender,
    nationality,
    residentialstatus,
    anniversarydate,
    kyc,
    riskcategory,
    acquisitiondate,
    country,
    state,
    city,
    pincode,
    mobile,
    email,
    address,
    services,
    pan,
    id,
    createdatetime,
  ]);
  return result;
}

async function deleteData(params) {
  const { pan, id } = params;

  const queryText = `delete from  clients  where pan_no=ANY($1) and id=ANY($2)`;
  const result = await transaction(queryText, [pan, id]);
  return result;
}

export default async function(request, fileUpload) {
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
