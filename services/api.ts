
import { 
  InternalAccount, 
  CitiTransaction,
  CustomerProfileResponse,
  AuthResponse,
  UserSession,
  AccountsGroupDetailsList
} from '../types/index';

// Auth0 Configuration Context
const AUTH0_CONFIG = {
  audience: 'https://ba46749e-fea0-4f87-b64b-210a05a245fa.mock.pstmn.io',
  issuerBaseURL: 'https://aibankinguniversity.us.auth0.com/',
  tokenSigningAlg: 'RS256'
};

// Unified mock account data consistent with Citi OpenAPI structures
const MOCK_ACCOUNTS_LIST: InternalAccount[] = [
  {
    id: 'citi_acc_99201',
    productName: 'Corporate Mastery Checking',
    accountNickname: 'Main Ops Node',
    displayAccountNumber: 'XXXXXX9594',
    currency: 'USD',
    status: 'ACTIVE',
    currentBalance: 1245000.50,
    availableBalance: 1240000.00,
    institutionName: 'Citi US',
    connectionId: 'CITI-G-001'
  },
  {
    id: 'citi_acc_44102',
    productName: 'Elite Treasury Savings',
    displayAccountNumber: 'XXXXXX1022',
    currency: 'USD',
    status: 'ACTIVE',
    currentBalance: 5200450.00,
    availableBalance: 5200450.00,
    institutionName: 'Citi US',
    connectionId: 'CITI-G-002'
  }
];

export const apiClient = {
  auth: {
    async me(): Promise<AuthResponse> {
      const user = localStorage.getItem('lumina_user');
      return user ? { isAuthenticated: true, user: JSON.parse(user) } : { isAuthenticated: false, user: null };
    },
    async register(username: string, password: string) {
      const users = JSON.parse(localStorage.getItem('lumina_registry') || '{}');
      if (users[username]) return { success: false, error: 'Identity already exists.' };
      users[username] = { password, role: 'Root Admin' };
      localStorage.setItem('lumina_registry', JSON.stringify(users));
      return { success: true };
    },
    async login(username: string, password?: string) {
      const users = JSON.parse(localStorage.getItem('lumina_registry') || '{"alex":{"password":"password123","role":"Root Admin"}}');
      if (users[username] && users[username].password === password) {
        const user = { 
          id: 'USR-1', 
          name: username, 
          role: users[username].role, 
          lastLogin: new Date().toISOString(),
          // Encapsulate the Auth0 handshake metadata
          handshake: AUTH0_CONFIG
        };
        localStorage.setItem('lumina_user', JSON.stringify(user));
        return { success: true, user };
      }
      return { success: false, error: 'Identity rejected credentials.' };
    },
    async logout() {
      localStorage.removeItem('lumina_user');
      return { success: true };
    }
  },
  chat: {
    async getHistory() {
      return JSON.parse(localStorage.getItem('lumina_chat_history') || '[]');
    },
    async saveMessage(role: string, content: string) {
      const history = JSON.parse(localStorage.getItem('lumina_chat_history') || '[]');
      history.push({ id: Date.now(), role, content, timestamp: new Date().toISOString() });
      localStorage.setItem('lumina_chat_history', JSON.stringify(history));
    }
  },
  async getRegistryNodes(): Promise<InternalAccount[]> {
    return MOCK_ACCOUNTS_LIST;
  },
  async getRegistryDetails(): Promise<AccountsGroupDetailsList> {
    return {
      accountGroupDetails: [
        {
          accountGroup: "CHECKING",
          checkingAccountsDetails: MOCK_ACCOUNTS_LIST.filter(a => a.productName.includes('Checking')).map(a => ({
            accountId: a.id,
            productName: a.productName,
            displayAccountNumber: a.displayAccountNumber,
            currencyCode: a.currency,
            accountStatus: a.status as 'ACTIVE',
            currentBalance: a.currentBalance,
            availableBalance: a.availableBalance,
            accountDescription: a.productName,
            balanceType: 'ASSET'
          }))
        }
      ]
    };
  },
  async getTransactions(accountId: string): Promise<CitiTransaction[]> {
    return [
      {
        accountId,
        currencyCode: 'USD',
        transactionAmount: -25000.00,
        transactionDate: new Date().toISOString().split('T')[0],
        transactionDescription: 'QUANTUM_COMPUTE_Q3_ALLOCATION',
        transactionId: 'TXN_C_' + Math.random().toString(36).substring(7).toUpperCase(),
        transactionStatus: 'POSTED',
        transactionType: 'PAYMENT',
        displayAccountNumber: 'XXXXXX9594'
      },
      {
        accountId,
        currencyCode: 'USD',
        transactionAmount: 14200.50,
        transactionDate: new Date().toISOString().split('T')[0],
        transactionDescription: 'NODE_ALPHA_INCENTIVE_PAYOUT',
        transactionId: 'TXN_C_' + Math.random().toString(36).substring(7).toUpperCase(),
        transactionStatus: 'POSTED',
        transactionType: 'CREDIT',
        displayAccountNumber: 'XXXXXX9594'
      }
    ];
  },
  async getStatements(): Promise<any> {
    return {
      statements: [
        { statementId: 'STMT-001', statementDate: '2024-03-01', productFamily: 'Checking', accountId: 'citi_acc_99201' },
        { statementId: 'STMT-002', statementDate: '2024-02-01', productFamily: 'Checking', accountId: 'citi_acc_99201' }
      ]
    };
  },
  async getStatementDetails(id: string): Promise<any> {
    return {
      dataPayload: JSON.stringify({
        encryptedPayload: {
          header: { alg: 'RSA-OAEP-4096', typ: 'JWT' },
          iv: 'q7x2...m9l0',
          data: 'base64_payload_artifact'
        }
      })
    };
  },
  async getCustomerProfile(accountId: string): Promise<CustomerProfileResponse> {
    return {
      customer: { firstName: 'Alex', lastName: 'Rivera', title: 'Mx.', companyName: 'Lumina Quantum Systems' },
      contacts: {
        emails: ['a.rivera@luminaquantum.io'],
        addresses: [{ addressLine1: '401 Quantum Drive', city: 'Palo Alto', region: 'CA', postalCode: '94304', country: 'US', type: 'BUSINESS' }],
        phones: [{ type: 'CELL', country: '1', number: '9542312002' }]
      }
    };
  }
};
