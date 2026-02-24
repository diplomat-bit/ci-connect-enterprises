
export interface Account {
  id: string;
  name: string;
  type: 'quantum_checking' | 'elite_savings' | 'high_yield_vault';
  balance: number;
  currency: string;
  institution: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  category: string;
  status: 'POSTED' | 'PENDING';
  type: string;
}

export interface InternalAccount {
  id: string;
  productName: string;
  displayAccountNumber: string;
  currency: string;
  status: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
  currentBalance: number;
  availableBalance: number;
  institutionName: string;
  connectionId: string;
}

export interface Counterparty {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  createdAt: string;
  metadata?: Record<string, any>;
  accounts?: Array<{
    id: string;
    accountType: string;
    accountNumber: string;
  }>;
}

export interface Connection {
  id: string;
  vendorCustomerId: string;
  entity: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastSyncedAt: string;
}

export interface Document {
  id: string;
  documentableId: string;
  documentableType: string;
  documentType: string;
  fileName: string;
  size: number;
  createdAt: string;
  format: string;
}

export interface SimulationResult {
  outcomeNarrative: string;
  projectedValue: number;
  confidenceScore: number;
  status: string;
  simulationId: string;
  keyRisks?: string[];
}

export interface Payee {
  payeeId: string;
  displayName: string;
  merchantName: string;
  status: string;
  address?: {
    line1: string;
    city: string;
    region: string;
    postalCode: string;
  };
}

export interface Payment {
  paymentId: string;
  amount: number;
  status: string;
  dueDate: string;
  toPayeeId: string;
  fromAccountId: string;
}

export interface CustomerProfileResponse {
  firstName: string;
  lastName: string;
  middleName: string;
  fullName: string;
  companyName: string;
  emails: Array<{
    emailAddress: string;
    preferenceType: string;
  }>;
  addressList: Array<{
    addressLine1: string;
    city: string;
    countryCode: string;
    postalCode: string;
    addressType: string;
  }>;
  phones: Array<{
    phoneType: string;
    fullPhoneNumber: string;
    preferenceType: string;
  }>;
}

export interface ClientRegisterResponse {
  client_id: string;
  client_secret: string;
  client_name: string;
  appId?: string;
  redirect_uris: string[];
  scope: string[];
  token_endpoint_auth_method?: string;
}

export interface VirtualAccount {
  id: string;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'PENDING' | 'CLOSED';
  internal_account_id: string;
  counterparty_id: string | null;
  created_at: string;
}

export interface LineItem {
  id: string;
  amount: number;
  currency: string;
  description: string;
  ledger_account_id: string;
  createdAt: string;
}

export interface LineItemUpdateRequest {
  description?: string;
  metadata?: Record<string, any>;
}
