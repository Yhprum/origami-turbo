import cx from "clsx";
import classes from "./FavoriteButton.module.css";

interface FavoriteButtonProps {
  active: boolean;
  onClick: () => void;
}
export default function FavoriteButton({
  active,
  onClick,
}: FavoriteButtonProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cx(classes.icon, { [classes.active]: active })}
      onClick={onClick}
      onKeyDown={onClick}
    >
      <title>Favorite</title>
      <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
    </svg>
  );
}
