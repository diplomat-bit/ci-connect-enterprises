interface Window {
  aistudio?: {
    auth?: {
      login: (options: any) => Promise<any>;
      logout: () => Promise<any>;
      getUser: () => Promise<any>;
    };
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  };
}
