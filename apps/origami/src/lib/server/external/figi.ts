const FIGI_BASE_URL = "https://api.openfigi.com/v3";
const FIGI_MAPPING_URL = `${FIGI_BASE_URL}/mapping`;

export async function validateBond(cusip: string) {
  const body = JSON.stringify([{ idType: "ID_CUSIP", idValue: cusip }]);
  const response = await fetch(FIGI_MAPPING_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  const data = await response.json();
  if (data[0].data) {
    return { valid: true, bond: data[0].data[0].ticker };
  }
  return { valid: false, bond: undefined };
}
