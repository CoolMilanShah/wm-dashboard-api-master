import manageClientData from '../repositories/manageClientData';
import manageTransactionData from '../repositories/manageTransactionData';
import manageVerticalData from '../repositories/manageVerticalData';
import manageSubVerticalData from '../repositories/manageSubVerticalData';
import manageVendorData from '../repositories/manageVendorData';
import manageCompanyData from '../repositories/manageCompanyData';
import manageFilterCategory from '../repositories/manageFilterCategory';
import manageExpenseData from '../repositories/manageExpenseData';
import manageInsuranceDetail from '../repositories/manageInsurancePolicyDetails';
import manageAumData from '../repositories/manageAumData';
import manageTermDepositData from '../repositories/manageTermDepositData';
import manageDashboardData from '../repositories/manageDashboardData';
import manageMiscData from '../repositories/manageMiscData';
import manageDocuments from '../repositories/manageDocuments';
import checkUserDetail from '../repositories/checkUserDetail';
import manageBranchData from '../repositories/manageBranchData';

export default async function callApi(serviceName, request) {
  //console.log(serviceName);
  switch (serviceName) {
    case 'manageverticaldata':
      return manageVerticalData(request);
    case 'managesubverticaldata':
      return manageSubVerticalData(request);
    case 'manageclientdata':
      return manageClientData(request);
    case 'managevendordata':
      return manageVendorData(request);
    case 'managetransactiondata':
      return manageTransactionData(request);
    case 'managecompanydata':
      return manageCompanyData(request);
    case 'managefiltercategory':
      return manageFilterCategory(request);
    case 'manageexpensedata':
      return manageExpenseData(request);
    case 'manageinsurancedetail':
      return manageInsuranceDetail(request);
    case 'manageaumdata':
      return manageAumData(request);
    case 'managetermdepositdetail':
      return manageTermDepositData(request);
    case 'managedashboarddata':
      return manageDashboardData(request);
    case 'managemiscdata':
      return manageMiscData(request);
    case 'docupload':
    case 'managedocument':
      return manageDocuments(request);
    case 'managebranchdata':
      return manageBranchData(request);
    case 'fileupload': {
      switch (request.body.category) {
        case 'transaction':
          return manageTransactionData(request, true);
        case 'client':
          return manageClientData(request, true);
        case 'insurance':
          return manageInsuranceDetail(request, true);
        case 'term_deposit':
          return manageTermDepositData(request, true);
        default:
          throw new Error('Service does not exist');
      }
    }
    case 'manageuserdetail':
      return checkUserDetail(request);
    default:
      throw new Error('Service does not exist');
  }
}
