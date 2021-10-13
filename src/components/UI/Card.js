import styles from "./Card.module.css";

const Card = (props) => {
  return (
    <div
      style={props.style}
      className={`${styles.card} ${styles[props.className]}`}
    >
      {props.children}
    </div>
  );
};

export default Card;
