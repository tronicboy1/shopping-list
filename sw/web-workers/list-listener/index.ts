/**
 * I tested using web workers for onValue listeners but the result was much slower
 * than simply running the listeners in the main thread.
 */

import { getAuth } from "firebase/auth";
import { getDatabase, onValue, ref, set } from "firebase/database";
import { firebaseApp } from "../../firebase";
import { ShoppingListData } from "../../../src/web-components/shopping-list/types";

getAuth(firebaseApp);

self.addEventListener("message", (event: MessageEvent<{ uid: string; listId: string }>) => {
  const data = event.data;
  if (!(data.listId && data.uid)) throw Error("uid and listId must be provided to worker.");
  const { uid, listId } = data;
  const db = getDatabase(firebaseApp);
  const listRef = ref(db, `${uid}/SHOPPING-LISTS/${listId}/data`);
  onValue(listRef, (snapshot) => {
    const result = snapshot.val() as ShoppingListData | null;
    if (!result || Object.keys(result).length === 0) {
      self.postMessage({ raw: null, ordered: null });
      return;
    }
    const keys = Object.keys(result);
    if (Object.values(result).some((value) => isNaN(Number(value.order)))) {
      keys.forEach((key, index) => (result[key].order = index)); // Reset order if order not present any children
      set(listRef, data);
      return;
    }
    self.postMessage({
      raw: result,
      sorted: Object.keys(result)
        .map((key) => ({ key, ...result![key] }))
        .sort((a, b) => (a.order < b.order ? -1 : 1)),
    });
  });
});
