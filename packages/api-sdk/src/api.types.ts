export type AsDto<T> = {
  [K in keyof T]: T[K] extends Date ? string : T[K];
};

export type OwlRelayEmail = {
  id: string;
  domain: string;
  username: string;
  webhookUrl: string;
  webhookSecret: string;
  isEnabled: boolean;
  allowedOrigins: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type OwlRelayEmailIdentifier = { emailId: string } | { emailAddress: string } | { username: string; domain: string };

export type OwlRelayEmailUpdate = Partial<Omit<OwlRelayEmail, 'id' | 'createdAt' | 'updatedAt'>>;

export type OwlRelayEmailProcessing = {
  id: string;
  emailId: string;
  status: string;
  error?: string;
  fromAddress: string;
  subject: string;
  webhookUrl?: string;
  webhookResponseStatusCode?: number;

  createdAt: Date;
  updatedAt: Date;
};
