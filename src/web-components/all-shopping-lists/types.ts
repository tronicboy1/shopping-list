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

export interface ListGroups {
  [id: string]: {
    [id: string]: ShoppingListItem;
  };
}
