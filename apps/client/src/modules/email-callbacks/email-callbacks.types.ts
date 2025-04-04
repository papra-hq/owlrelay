export type EmailCallback = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isEnabled: boolean;
  domain: string;
  username: string;
  allowedOrigins: string[];
  webhookUrl: string;
  hasWebhookSecret: boolean;
};

export type EmailProcessing = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  error?: string;
  fromAddress: string;
  subject: string;
  webhookUrl?: string;
  webhookResponseStatusCode?: number;
};
