// eslint-disable-next-line import/no-named-as-default
import transaction from "../adapters/index";
import csvRead from "./csvRead";

function mycallback(results) {
  const verticalNames = results.map(value => {
    return value.verticalName;
  });
  const subVerticalNames = results.map(value => {
    return value.subVerticalName;
  });
  const vendors = results.map(value => {
    return value.vendor;
  });
  const companies = results.map(value => {
    return value.company;
  });

  const verticalIds = [];
  let i;

  for (i = 0; i < verticalNames.length; i += 1) {
    verticalIds[i] = verticalNames[i].slice(3);
    verticalIds[i] += subVerticalNames[i].slice(3);
    if (vendors[i] !== "NA") {
      verticalIds[i] += vendors[i].slice(3);
    }
  }

  const queryText = "SELECT public.add_verticals($1,$2,$3,$4,$5)";
  return transaction(queryText, [
    verticalIds,
    verticalNames,
    subVerticalNames,
    vendors,
    companies
  ]);
}

export default async function upload() {
  return csvRead(mycallback);
}
