import db, { transaction } from '../adapters/index';
import csvRead from './csvRead';

const path = require('path');

async function convertParsedTransactionCSVDataToArrays(results) {
  const Vendor = results.map(value => {
    return value.Vendor;
  });
  const Company = results.map(value => {
    return value.Company;
  });
  const ProductType = results.map(value => {
    return value.ProductType;
  });
  const FirstHolder = results.map(value => {
    return value.FirstHolder;
  });
  const SecondHolder = results.map(value => {
    return value.SecondHolder;
  });
  const ThirdHolder = results.map(value => {
    return value.ThirdHolder;
  });
  const ApplicationNo = results.map(value => {
    return value.ApplicationNo;
  });
  const CertificateNo = results.map(value => {
    return value.CertificateNo;
  });
  const Period = results.map(value => {
    return value.Period;
  });
  const StartDate = results.map(value => {
    return value.StartDate;
  });
  const MaturityDate = results.map(value => {
    return value.MaturityDate;
  });
  const DepositAmount = results.map(value => {
    return value.DepositAmount;
  });
  const InterestRate = results.map(value => {
    return value.InterestRate;
  });
  const InterestFrequency = results.map(value => {
    return value.InterestFrequency;
  });
  const MaturityAmount = results.map(value => {
    return value.MaturityAmount;
  });
  const Nominee = results.map(value => {
    return value.Nominee;
  });
  const Remarks = results.map(value => {
    return value.Remarks;
  });

  const queryText =
    'SELECT public.upload_term_deposits($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)';
  const result = await transaction(queryText, [
    Vendor,
    Company,
    ProductType,
    FirstHolder,
    SecondHolder,
    ThirdHolder,
    ApplicationNo,
    CertificateNo,
    Period,
    StartDate,
    MaturityDate,
    DepositAmount,
    InterestRate,
    InterestFrequency,
    MaturityAmount,
    Nominee,
    Remarks,
  ]);

  return result;
}

async function uploadData(filename) {
  const uploadfileName = path.join('public', filename);
  return csvRead(uploadfileName, convertParsedTransactionCSVDataToArrays);
}

async function getData({ filterValue }) {
  const params = JSON.parse(filterValue);

  let whereClause = 'where first_holder is not null and vendor is not null';

  if (params.Vendors.search('Select')) {
    whereClause += ` and vendor='${params.Vendors}'`;

    if (params.Company.search('Select')) {
      whereClause += ` and company='${params.Company}'`;
    }
  }

  const data = await db.query(
    `Select   id, vendor,company, product_type as producttype, first_holder as firstholder, second_holder as secondholder, third_holder as thirdholder,
     application_no as applicationno, certificate_no as certificateno, period as "period (months)", to_char(start_date, 'yyyy-mm-dd')  as startdate,
     to_char(maturity_date, 'yyyy-mm-dd')  as maturitydate, deposit_amount as depositamount, interest_rate as interestrate,
     interest_frequency as interestfrequency, maturity_amount as maturityamount, nominee, remarks,  created_date_time as createdatetime, false as renew from  term_deposit  ${whereClause} order by vendor`,
  );

  return data.rows;
}

async function insertData(params) {
  const {
    producttype,
    firstholder,
    secondholder,
    thirdholder,
    applicationno,
    certificateno,
    startdate,
    maturitydate,
    depositamount,
    interestrate,
    interestfrequency,
    maturityamount,
    nominee,
    Vendors,
    Company,
    remarks,
    createdatetime,
  } = params;
  const queryText = `INSERT INTO term_deposit(vendor, company, product_type, first_holder, second_holder, third_holder, application_no,
      certificate_no, start_date, maturity_date, deposit_amount, interest_rate, interest_frequency, maturity_amount, nominee,
      remarks, period, created_date_time) VALUES ($1, $2, $3, $4, $5, $6,$7,$8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`;
  const result = await transaction(queryText, [
    Vendors,
    Company,
    producttype,
    firstholder,
    secondholder,
    thirdholder,
    applicationno,
    certificateno,
    startdate,
    maturitydate,
    depositamount,
    interestrate,
    interestfrequency,
    maturityamount,
    nominee,
    remarks,
    params['period (months)'],
    createdatetime,
  ]);
  return result;
}

async function updateData(params) {
  if (params.renew) {
    return insertData({
      ...params,
      Vendors: params.vendor,
      Company: params.company,
    });
  }
  const {
    applicationno,
    certificateno,
    maturitydate,
    depositamount,
    interestrate,
    interestfrequency,
    maturityamount,
    nominee,
    vendor,
    company,
    remarks,
    id,
    createdatetime,
  } = params;
  const queryText = `update term_deposit set maturity_date=$1,
  deposit_amount=$2,
  interest_rate=$3,
  interest_frequency=$4,
  maturity_amount=$5,
  nominee=$6,remarks=$7, period=$8, created_date_time=$14 where vendor=$9 and company=$10 and application_no=$11 and certificate_no=$12 and id=$13`;
  const result = await transaction(queryText, [
    maturitydate,
    depositamount,
    interestrate,
    interestfrequency,
    maturityamount,
    nominee,
    remarks,
    params['period (months)'],
    vendor,
    company,
    applicationno,
    certificateno,
    id,
    createdatetime,
  ]);
  return result;
}

async function deleteData(params) {
  const {
    applicationno,
    certificateno,
    vendor,
    company,
    firstholder,
    id,
  } = params;

  const queryText = `delete from  term_deposit  where vendor=ANY($1) and company=ANY($2) and (application_no=ANY($3) or application_no is null)
                     and certificate_no=ANY($4) and first_holder=ANY($5) and id=ANY($6)`;
  const result = await transaction(queryText, [
    vendor,
    company,
    applicationno,
    certificateno,
    firstholder,
    id,
  ]);
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
