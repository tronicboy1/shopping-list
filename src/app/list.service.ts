import { Firebase } from "@firebase-logic";
import { ListGroups, ShoppingListData, ShoppingListItem } from "@web-components/all-shopping-lists/types";
import { child, DataSnapshot, get, onValue, push, ref, remove, set } from "firebase/database";
import { ref as getStorageRef, deleteObject } from "firebase/storage";
import { from, map, mergeMap, Observable, timeout } from "rxjs";

export class ListService {
  private static _listsCache$?: Observable<ListGroups>;
  private static _cachedUid?: string;

  public static getLists(uid: string): Observable<ListGroups> {
    if (uid !== this._cachedUid) this._listsCache$ = undefined;
    return (this._listsCache$ ||= this.getOnValueObserver(uid).pipe(
      timeout({ first: 4000 }),
      map((result) => result.val() ?? {})
    ));
  }

  public static deleteList(uid: string, listId: string) {
    return remove(this.getDatabaseRef(uid, listId, false));
  }

  public static deleteItem(uid: string, listId: string, itemId: string) {
    return from(this.getListItem(uid, listId, itemId)).pipe(
      map((result) => {
        if (!result.exists()) throw TypeError("Cannot delete item that does not exist.");
        return result.val() as ShoppingListItem;
      }),
      mergeMap((data) => {
        const storagePromise = data.imagePath
          ? deleteObject(getStorageRef(Firebase.storage, data.imagePath))
          : Promise.resolve();
        return Promise.all([remove(child(this.getDatabaseRef(uid, listId), itemId)), storagePromise]);
      })
    );
  }

  public static addItem(uid: string, listId: string, newData: ShoppingListItem) {
    return push(this.getDatabaseRef(uid, listId), newData);
  }

  public static updateList(uid: string, listId: string, newData: ShoppingListData) {
    return set(this.getDatabaseRef(uid, listId), newData);
  }

  private static getOnValueObserver(uid: string) {
    return new Observable<DataSnapshot>((observer) =>
      onValue(
        ref(Firebase.db, `${uid}/SHOPPING-LISTS/`),
        (snapshot) => observer.next(snapshot),
        (err) => observer.error(err)
      )
    );
  }

  private static getDatabaseRef(uid: string, listId: string, data = true) {
    return ref(Firebase.db, `${uid}/SHOPPING-LISTS/${listId}/${data ? "data" : ""}`);
  }

  private static getListItem(uid: string, listId: string, itemId: string) {
    return get(child(this.getDatabaseRef(uid, listId), itemId));
  }
}
