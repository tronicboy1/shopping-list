export type ShoppingListData = Record<string, ShoppingListItem>;

export interface ShoppingListItem {
  item: string;
  memo: string;
  dateAdded: number;
  amount: number;
  imagePath: string;
  priority: boolean;
  order: number;
}

export type ListGroups = Record<string, { data: ShoppingListItem | undefined; listName: string }>;
