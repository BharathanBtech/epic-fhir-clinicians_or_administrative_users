// FHIR Resource Types
export interface FHIRPatient {
  id: string;
  name?: Array<{
    text?: string;
    given?: string[];
    family?: string;
  }>;
  gender?: string;
  birthDate?: string;
  address?: Array<{
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
  }>;
  telecom?: Array<{
    system: string;
    value: string;
  }>;
  identifier?: Array<{
    system?: string;
    value?: string;
  }>;
}

export interface FHIRCoverage {
  id: string;
  status: string;
  type: FHIRCodeableConcept;
  subscriber: FHIRReference;
  beneficiary: FHIRReference;
  relationship: FHIRCodeableConcept;
  period: {
    start: string;
    end?: string;
  };
  payor: FHIRReference[];
  class: Array<{
    type: FHIRCodeableConcept;
    value: string;
    name: string;
  }>;
}

export interface FHIRExplanationOfBenefit {
  id: string;
  status: string;
  type: FHIRCodeableConcept;
  use: string;
  patient: FHIRReference;
  billablePeriod: {
    start: string;
    end?: string;
  };
  created: string;
  insurer: FHIRReference;
  provider: FHIRReference;
  facility?: FHIRReference;
  item: FHIREOBItem[];
  total: FHIREOBTotal[];
  payment?: FHIREOBPayment;
}

export interface FHIREOBItem {
  sequence: number;
  productOrService: FHIRCodeableConcept;
  category?: FHIRCodeableConcept;
  servicedDate?: string;
  servicedPeriod?: {
    start: string;
    end: string;
  };
  net: FHIRMoney;
  adjudication: FHIREOBAdjudication[];
}

export interface FHIREOBTotal {
  category: FHIRCodeableConcept;
  amount: FHIRMoney;
}

export interface FHIREOBPayment {
  type: FHIRCodeableConcept;
  amount: FHIRMoney;
}

export interface FHIREOBAdjudication {
  category: FHIRCodeableConcept;
  reason?: FHIRCodeableConcept;
  amount: FHIRMoney;
}

// Common FHIR Types
export interface FHIRCodeableConcept {
  coding?: Array<{
    system: string;
    code: string;
    display: string;
  }>;
  text?: string;
}

export interface FHIRReference {
  reference?: string;
  display?: string;
}

export interface FHIRMoney {
  value: number;
  currency: string;
}

// API Response Types
export interface FHIRBundle {
  resourceType: string;
  type: string;
  total: number;
  entry: Array<{
    resource: any;
  }>;
}

// Application Types
export interface PatientDetails {
  id: string;
  mrn?: string;
  name: string;
  given?: string;
  family?: string;
  gender?: string;
  birthDate?: string;
  maritalStatus?: string;
  address?: {
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  phone?: string;
  email?: string;
  language?: string;
  ethnicity?: string;
  race?: string;
  deceased?: boolean;
  deceasedDate?: string;
  multipleBirth?: boolean;
  multipleBirthCount?: number;
  photo?: string;
  contact?: Array<{
    relationship?: string;
    name?: string;
    phone?: string;
    email?: string;
  }>;
  practitionerIds?: string[];
  organizationIds?: string[];
}

export interface PractitionerDetails {
  id: string;
  identifier?: Array<{
    system?: string;
    value?: string;
    type?: any;
  }>;
  active?: boolean;
  name?: {
    use?: string;
    text?: string;
    family?: string;
    given?: string[];
    prefix?: string[];
    suffix?: string[];
  };
  telecom?: Array<{
    system?: string;
    value?: string;
    use?: string;
  }>;
  address?: Array<{
    use?: string;
    type?: string;
    text?: string;
    line?: string[];
    city?: string;
    district?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
  gender?: string;
  birthDate?: string;
  photo?: Array<{
    contentType?: string;
    language?: string;
    data?: string;
    url?: string;
    size?: number;
    hash?: string;
    title?: string;
  }>;
  qualification?: Array<{
    identifier?: Array<{
      system?: string;
      value?: string;
    }>;
    code?: any;
    period?: {
      start?: string;
      end?: string;
    };
    issuer?: any;
  }>;
  communication?: Array<{
    language?: any;
    preferred?: boolean;
  }>;
}

export interface OrganizationDetails {
  id: string;
  identifier?: Array<{
    system?: string;
    value?: string;
    type?: any;
  }>;
  active?: boolean;
  name?: string;
  alias?: string[];
  telecom?: Array<{
    system?: string;
    value?: string;
    use?: string;
  }>;
  address?: Array<{
    use?: string;
    type?: string;
    text?: string;
    line?: string[];
    city?: string;
    district?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
  type?: any;
  partOf?: any;
  contact?: Array<{
    purpose?: any;
    name?: any;
    telecom?: Array<{
      system?: string;
      value?: string;
      use?: string;
    }>;
    address?: any;
  }>;
  endpoint?: Array<{
    reference?: string;
    type?: string;
  }>;
}

export interface CoverageDetails {
  id: string;
  status: string;
  type: string;
  subscriber: string;
  beneficiary: string;
  relationship: string;
  period: {
    start: string;
    end?: string;
  };
  payor: string[];
  class: Array<{
    type: string;
    value: string;
    name: string;
  }>;
}

export interface EOBDetails {
  id: string;
  status: string;
  type: string;
  use: string;
  patient: string;
  billablePeriod: {
    start: string;
    end?: string;
  };
  created: string;
  insurer: string;
  provider: string;
  facility?: string;
  item: EOBItemDetails[];
  total: EOBTotalDetails[];
  payment?: EOBPaymentDetails;
}

export interface EOBItemDetails {
  sequence: number;
  productOrService: string;
  category?: string;
  servicedDate?: string;
  servicedPeriodStart?: string;
  servicedPeriodEnd?: string;
  net: number;
  adjudication: EOBAdjudicationDetails[];
}

export interface EOBTotalDetails {
  category: string;
  amount: number;
  currency: string;
  categoryCode: string;
  categorySystem: string;
}

export interface EOBPaymentDetails {
  type: string;
  amount: number;
}

export interface EOBAdjudicationDetails {
  category: string;
  reason?: string;
  amount: number;
}

export interface FundingSummary {
  totalBilled: number;
  totalCovered: number;
  totalPatientResponsibility: number;
  totalCopay: number;
  totalDeductible: number;
  remainingBalance: number;
  claimCount: number;
}

export interface PatientFundingData {
  patient: PatientDetails;
  coverage: CoverageDetails[];
  eobs: EOBDetails[];
  practitioners: PractitionerDetails[];
  organizations: OrganizationDetails[];
  fundingSummary: FundingSummary;
}
