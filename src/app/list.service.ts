import { Firebase } from "@firebase-logic";
import { ListGroups } from "@web-components/all-shopping-lists/types";
import { DataSnapshot, onValue, ref } from "firebase/database";
import { map, Observable, timeout } from "rxjs";

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

  private static getOnValueObserver(uid: string) {
    return new Observable<DataSnapshot>((observer) =>
      onValue(
        ref(Firebase.db, `${uid}/SHOPPING-LISTS/`),
        (snapshot) => observer.next(snapshot),
        (err) => observer.error(err)
      )
    );
  }
}
