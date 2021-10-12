import styles from "./Input.module.css";

const Input = (props) => {
  return (
    <div className={`${styles["form-control"]} ${styles[props.className]}`}>
      <label htmlFor={props.id}>{props.label}</label>
      <input
        onChange={props.onChange}
        onBlur={props.onBlur}
        placeholder={props.placeholder}
        value={props.value}
        type={props.type}
      />
      {props.description && <small>{props.description}</small>}
    </div>
  );
};

export default Input;
