import { IUser } from "./user";

export interface PostData {
  id: string;
  title: string;
  content: string;
  cover?: any;
  description?: string;
  tags?: string[];
  metaDescription?: string;
  metaKeywords?: string[];
  metaTitle?: string;
  publish: boolean;
  allowComments: boolean;
  author: IUser;
  createdAt: string;
  updatedAt?: string;
  view?: number;
  comment?: number;
  share?: number;
  favorite?: number;
  commentCount?: number;
  favoritePerson?: IUser[];
}
