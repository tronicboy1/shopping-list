import Button from "./Button";

import styles from "./Input.module.css";

const Input = (props) => {
  return (
    <div
      style={props.style}
      className={`${styles["form-control"]} ${styles[props.button && "left"]} ${
        styles[props.className]
      }`}
    >
      <label htmlFor={props.id}>{props.label}</label>
      <div className={styles["input-bar"]}>
        <input
          onChange={props.onChange}
          onBlur={props.onBlur}
          placeholder={props.placeholder}
          value={props.value}
          type={props.type}
        />
        {props.button && (
          <Button type="submit" borderRadius="right">
            {props.button}
          </Button>
        )}
      </div>
      {props.description && <small>{props.description}</small>}
    </div>
  );
};

export default Input;
