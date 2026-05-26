export interface PartyDetails {
  company: string;
  signatoryName: string;
  title: string;
  noticeAddress: string;
  signatureDate: string;
}

export interface NdaFormValues {
  purpose: string;
  effectiveDate: string;
  mndaTerm: { type: 'fixed'; years: number } | { type: 'atWill' };
  termOfConfidentiality: { type: 'fixed'; years: number } | { type: 'perpetual' };
  governingLaw: string;
  jurisdiction: string;
  modifications: string;
  party1: PartyDetails;
  party2: PartyDetails;
}
