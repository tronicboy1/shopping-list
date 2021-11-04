import { useState, useEffect } from "react";
import { ref, onValue, getDatabase, set, push } from "firebase/database";

const useFirebase = (userId, path = "", unpacker) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setError] = useState(null);

  useEffect(() => {
    console.log("effect");
    setLoading(true);
    const database = getDatabase();
    const hookRef = ref(database, `${userId}/${path}`);
    onValue(hookRef, (snapshot) => {
      const newData = snapshot.val();
      setData(newData);
      setLoading(false);
    });
    return () => {
      setData(null);
      setLoading(false);
    };
  }, [userId, path]);

  const setHandler = (desigPath, dataToWrite) => {
    setLoading(true);
    const database = getDatabase();
    set(ref(database, desigPath), dataToWrite)
      .then(() => setLoading(false))
      .catch((e) => setError(e.message));
  };

  const writeData = (subpath, item) => {
    setHandler(`${userId}/${path}/${subpath}`, item)
  };

  const addData = (newItem) => {
    const db = getDatabase();
    push(ref(db, `${userId}/${path}`), newItem)
  };

  const remove = (name) => {
    const newData = { ...data };
    delete newData[name];
    setHandler(`${userId}/${path}`, newData);
  };

  const removeAll = () => {
    setHandler(`${userId}/${path}`, {});
  };

  const list = [];

  for (const name in data) {
    list.push(unpacker(name, data));
  }

  return { data, loading, errors, list, writeData, addData, remove, removeAll };
};

export default useFirebase;
