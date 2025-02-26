export type Address = {
  address?: string;
  name?: string;
};

export type Email = {
  from: Address;
  to?: Address[];
  cc?: Address[];
  subject?: string;
  text?: string;
  html?: string;
  attachments?: {
    filename: string | null;
    mimeType: string;
    content: ArrayBuffer | string;
  }[];
};
