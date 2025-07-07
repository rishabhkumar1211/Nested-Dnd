export interface ListItem {
  id: number;
  title: string;
  children: ListItem[];
}

export type ListItems = ListItem[];