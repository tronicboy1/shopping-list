import { Firebase } from "@firebase-logic";
import { ListGroups } from "@web-components/all-shopping-lists/types";
import { DataSnapshot, onValue, ref } from "firebase/database";
import { map, Observable, shareReplay } from "rxjs";

export class ListService {
  private static _listsCache$?: Observable<ListGroups>;
  private static _cachedUid?: string;

  public static getLists(uid: string): Observable<ListGroups> {
    if (uid !== this._cachedUid) this._listsCache$ = undefined;
    return (this._listsCache$ ||= new Observable<DataSnapshot>((observer) =>
      onValue(ref(Firebase.db, `${uid}/SHOPPING-LISTS/`), (snapshot) => observer.next(snapshot))
    ).pipe(
      map((result) => result.val() ?? {}),
      shareReplay(1)
    ));
  }
}
