export interface EODHDOptionResponse {
  meta: {
    offset: number;
    limit: number;
    total: number;
    fields: string[];
  };
  data: {
    id: string;
    type: "options-contracts";
    attributes: {
      contract: string;
      type: "call" | "put";
      strike: number;
      exp_date: string;
      bid: number | null;
      ask: number | null;
      delta: number;
      open_interest: number;
      volatility: number;
    };
  }[];
  links: {
    next: string;
  };
}
