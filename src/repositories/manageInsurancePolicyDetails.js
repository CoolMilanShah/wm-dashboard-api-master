import db, { transaction } from '../adapters/index';
import csvRead from './csvRead';

const path = require('path');

async function convertParsedTransactionCSVDataToArrays(results) {
  const PlanType = results.map(value => {
    return value.PlanType;
  });
  const ApplicationNo = results.map(value => {
    return value.ApplicationNo;
  });
  const PolicyNo = results.map(value => {
    return value.PolicyNo;
  });
  const StartDate = results.map(value => {
    return value.StartDate;
  });
  const Nominee = results.map(value => {
    return value.Nominee;
  });
  const PolicyName = results.map(value => {
    return value.PolicyName;
  });
  const InvestorName = results.map(value => {
    return value.InvestorName;
  });
  const SumInsured = results.map(value => {
    return value.SumInsured;
  });
  const PremiumAmount = results.map(value => {
    return value.PremiumAmount;
  });
  const PaymentFrequency = results.map(value => {
    return value.PaymentFrequency;
  });
  const AnnualPremium = results.map(value => {
    return value.AnnualPremium;
  });
  const NextPremiumDueDate = results.map(value => {
    return value.NextPremiumDueDate;
  });
  const Remarks = results.map(value => {
    return value.Remarks;
  });
  const verticalNames = results.map(value => {
    return value.VerticalName;
  });
  const subVerticalNames = results.map(value => {
    return value.SubVerticalName;
  });
  const vendors = results.map(value => {
    return value.Vendor;
  });
  const companies = results.map(value => {
    return value.Company;
  });
  const dob = results.map(value => {
    return value.DOB;
  });
  const panNo = results.map(value => {
    return value.PanNo;
  });

  const queryText =
    'SELECT public.upload_insurance_info($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)';
  const result = await transaction(queryText, [
    PlanType,
    ApplicationNo,
    PolicyNo,
    StartDate,
    Nominee,
    PolicyName,
    InvestorName,
    SumInsured,
    PremiumAmount,
    PaymentFrequency,
    AnnualPremium,
    NextPremiumDueDate,
    Remarks,
    verticalNames,
    subVerticalNames,
    vendors,
    companies,
    dob,
    panNo,
  ]);

  return result;
}

async function uploadData(filename) {
  const uploadfileName = path.join('public', filename);
  return csvRead(uploadfileName, convertParsedTransactionCSVDataToArrays);
}

async function getData({ filterValue }) {
  const params = JSON.parse(filterValue);

  let whereClause =
    'where investor_name is not null and sub_vertical_name is not null';

  if (params['Sub-Verticals'].search('Select')) {
    whereClause += ` and sub_vertical_name='${params['Sub-Verticals']}'`;

    if (params.Vendors.search('Select')) {
      whereClause += ` and vendor='${params.Vendors}'`;
    }
    if (params.Company.search('Select')) {
      whereClause += ` and company='${params.Company}'`;
    }
  }

  const data = await db.query(
    `Select  id, sub_vertical_name as "sub-vertical", vendor,company, plan_type as plantype, policy_name as policyname, investor_name as investorname, nominee,
     application_no as applicationno, policy_no as policyno, to_char(start_date, 'yyyy-mm-dd') as startdate, sum_insured as suminsured, premium_amount as premiumamount,
     payment_frequency as paymentfrequency, annual_premium as annualpremium, to_char(next_premium_due_date, 'yyyy-mm-dd') as duedate, remarks,
     to_char(client_dob, 'yyyy-mm-dd') as dob, term,  created_date_time as createdatetime, false as renew from insurance  ${whereClause} order by "sub-vertical"`,
  );

  return data.rows;
}

async function insertData(params) {
  const {
    plantype,
    policyname,
    investorname,
    applicationno,
    policyno,
    startdate,
    suminsured,
    premiumamount,
    paymentfrequency,
    annualpremium,
    duedate,
    Vendors,
    Company,
    remarks,
    dob,
    nominee,
    createdatetime,
    term,
  } = params;
  const queryText = `INSERT INTO insurance(sub_vertical_name, vendor, company, plan_type, policy_name, investor_name, application_no,
      policy_no, start_date, sum_insured, premium_amount, payment_frequency, annual_premium, next_premium_due_date,
      remarks, client_dob, nominee, created_date_time, term) VALUES ($1, $2, $3, $4, $5, $6,$7,$8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`;
  const result = await transaction(queryText, [
    params['Sub-Verticals'],
    Vendors,
    Company,
    plantype,
    policyname,
    investorname,
    applicationno,
    policyno,
    startdate,
    suminsured,
    premiumamount,
    paymentfrequency,
    annualpremium,
    duedate,
    remarks,
    dob,
    nominee,
    createdatetime,
    term,
  ]);
  return result;
}

async function updateData(params) {
  if (params.renew) {
    return insertData({
      ...params,
      'Sub-Verticals': params['sub-vertical'],
      Vendors: params.vendor,
      Company: params.company,
    });
  }
  const {
    vendor,
    company,
    investorname,
    applicationno,
    policyno,
    startdate,
    suminsured,
    premiumamount,
    paymentfrequency,
    annualpremium,
    duedate,
    remarks,
    nominee,
    id,
    createdatetime,
    term,
  } = params;
  const queryText = `update insurance set investor_name=$1,  start_date=$2, sum_insured=$3, premium_amount=$4, payment_frequency=$5, annual_premium=$6,
                     next_premium_due_date=$7 , remarks=$8, nominee=$14, created_date_time=$16, term=$17 where sub_vertical_name=$9 and vendor=$10 and company=$11 and policy_no=$12 and
                     application_no=$13 and id=$15`;

  const result = await transaction(queryText, [
    investorname,
    startdate,
    suminsured,
    premiumamount,
    paymentfrequency,
    annualpremium,
    duedate,
    remarks,
    params['sub-vertical'],
    vendor,
    company,
    policyno,
    applicationno,
    nominee,
    id,
    createdatetime,
    term,
  ]);
  return result;
}

async function deleteData(params) {
  const {
    vendor,
    company,
    investorname,
    applicationno,
    policyno,
    policyname,
    id,
  } = params;
  const queryText = `delete from insurance where sub_vertical_name=ANY($1) and vendor=ANY($2) and company=ANY($3) and policy_no=ANY($4)
                     and (application_no=ANY($5) or application_no is null) and investor_name=ANY($6) and policy_name=ANY($7) and id=ANY($8)`;

  const result = await transaction(queryText, [
    params['sub-vertical'],
    vendor,
    company,
    policyno,
    applicationno,
    investorname,
    policyname,
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
