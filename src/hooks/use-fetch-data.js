import { useState, useEffect } from "react";
import { ref, onValue } from 'firebase/database';

const useFetchData = (db, value) => {
    const [data,setData] = useState(null);
    useEffect(() => {
        ref.on(value, snapshot => {
            if (snapshot.val()) {
                setData(snapshot.val());
            }
        });
        return () => {
            ref.off();
        };
    }, [ref])

    return { data };
};

export default useFetchData;