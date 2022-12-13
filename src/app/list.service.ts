import { Firebase } from "@firebase-logic";
import { ListGroups } from "@web-components/all-shopping-lists/types";
import { DataSnapshot, onValue, ref } from "firebase/database";
import { fromEvent, map, Observable, of, shareReplay, startWith, switchMap } from "rxjs";

export class ListService {
  private static _listsCache$?: Observable<ListGroups>;
  private static _cachedUid?: string;
  private static isVisible$ = fromEvent(document, "visibilitychange").pipe(
    map(() => document.visibilityState === "visible"),
    startWith(true)
  );

  public static getLists(uid: string): Observable<ListGroups> {
    if (uid !== this._cachedUid) this._listsCache$ = undefined;
    return (this._listsCache$ ||= this.isVisible$.pipe(
      switchMap((isVisible) => (isVisible ? this.getOnValueObserver(uid) : of({}))),
      shareReplay(1)
    ));
  }

  private static getOnValueObserver(uid: string) {
    return new Observable<DataSnapshot>((observer) =>
      onValue(
        ref(Firebase.db, `${uid}/SHOPPING-LISTS/`),
        (snapshot) => observer.next(snapshot),
        (err) => observer.error(err)
      )
    ).pipe(map((result) => result.val() ?? {}));
  }
}
