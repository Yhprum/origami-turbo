export const RATE = (
  nper: number,
  pmt: number,
  pv: number,
  fv = 0,
  type = 0,
  guess = 0.1
) => {
  if (nper <= 0) return null;

  const epslMax = 0.0000001;
  const step = 0.00001;
  const iterMax = 128;

  let Rate0 = guess;
  let Y0 = EVALRATE(Rate0, nper, pmt, pv, fv, type);
  let Rate1 = Y0 > 0 ? Rate0 / 2 : Rate0 * 2;
  let Y1 = EVALRATE(Rate1, nper, pmt, pv, fv, type);
  let i = 0;

  while (i < iterMax) {
    if (Y1 === Y0) {
      Rate0 = Rate0 < Rate1 ? Rate0 - step : Rate0 - step * -1;
      Y0 = EVALRATE(Rate0, nper, pmt, pv, fv, type);
    }

    if (Y1 === Y0) return null;

    Rate0 = Rate1 - ((Rate1 - Rate0) * Y1) / (Y1 - Y0);
    Y0 = EVALRATE(Rate0, nper, pmt, pv, fv, type);

    if (Math.abs(Y0) < epslMax) {
      return Rate0;
    }

    let tempVar = Y0;
    Y0 = Y1;
    Y1 = tempVar;
    tempVar = Rate0;
    Rate0 = Rate1;
    Rate1 = tempVar;
    i++;
  }
};

const EVALRATE = (
  rate: number,
  nper: number,
  pmt: number,
  pv: number,
  fv: number,
  type: number
) => {
  if (rate === 0) return pv + pmt * nper + fv;

  const tempVar3 = rate + 1;
  const tempVar = tempVar3 ** nper;
  const tempVar2 = type !== 0 ? 1 + rate : 1;

  return pv * tempVar + (pmt * tempVar2 * (tempVar - 1)) / rate + fv;
};
