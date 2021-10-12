import { useState, useEffect, useCallback } from "react";

const useHttp = (config) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const [data, setData] = useState(null);

  const httpHandler = useCallback(async (config) => {
    setLoading(true);
    setData(null);
    setErrors(null);

    try {
      const result = await fetch(config.uri, {
        method: config.method,
        headers: { "Content-type": "application/json" },
        body: config.body ? JSON.stringify(config.body) : null,
      });

      if (!result.ok) {
        throw new Error(result.status);
      }

      const data = await result.json();
      setData(data);
    } catch (e) {
        setErrors(e);
    }
    setLoading(false);
  }, []);

  useEffect(httpHandler(config), [config]);

  return { loading, errors, data };
};

export default useHttp;
