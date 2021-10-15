import { useState, useEffect, useCallback } from "react";

const useHttp = (config) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const [data, setData] = useState(null);

  const httpHandler = useCallback(async (config) => {
    setLoading(true);
    setErrors(null);

    try {
      if (config.method === "POST" || config.method === "PUT") {
        const post = await fetch(config.uri, {
          method: config.method,
          headers: { "Content-type": "application/json" },
          body: JSON.stringify(config.body),
        });
        if (!post.ok) {
          throw new Error(post.status);
        }
      }

      const get = await fetch(config.uri, { method: "GET" });

      if (!get.ok) {
        throw new Error(get.status);
      }

      const data = await get.json();
      setData(data);
    } catch (e) {
      setErrors(e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (config.uri) {
      console.log("http request sent");
      httpHandler(config);
    }
  }, [config, httpHandler]);

  return { loading, errors, data };
};

export default useHttp;
