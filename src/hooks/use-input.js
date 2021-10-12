import { useState } from "react";

const useInput = (validator) => {
    const [value, setValue] = useState("");
    const [touched, setTouched] = useState(false);

    const isValid = validator(value);

    const inputHandler = e => {
        setValue(e.target.value);
    };

    const blurHandler = e => {
        setTouched(true);
    };

    const reset = () => {};
    
    return {
        value,
        touched,
        isValid,
        inputHandler,
        blurHandler,
        reset
    };
};

export default useInput;