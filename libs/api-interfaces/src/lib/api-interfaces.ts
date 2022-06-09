export interface Message {
  message: string;
}

export interface Login {
  email: string;
  token: string;
  name?: string;
  role?: string;
}

export interface Categories {
  categories: string[];
}
