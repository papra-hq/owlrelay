export type EmailCallback = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isEnabled: boolean;
  domain: string;
  username: string;
  allowedOrigins: string[];
  webhookUrl: string;
  webhookSecret: string;
};
