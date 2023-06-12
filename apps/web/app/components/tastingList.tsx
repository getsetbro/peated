import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { Tasting } from "~/types";
import TastingListItem from "./tastingListItem";

export default function TastlingList({
  values,
  noBottle,
}: {
  values: Tasting[];
  noBottle?: boolean;
}) {
  const [deletedValues, setDeletedValues] = useState<number[]>([]);

  const onDelete = (tasting: Tasting) => {
    setDeletedValues((arr) => [...arr, tasting.id]);
  };

  return (
    <ul className="sm:rounded md:flex md:flex-wrap">
      <AnimatePresence>
        {values
          .filter((t) => deletedValues.indexOf(t.id) === -1)
          .map((tasting) => (
            <TastingListItem
              key={tasting.id}
              tasting={tasting}
              onDelete={onDelete}
              noBottle={noBottle}
            />
          ))}
      </AnimatePresence>
    </ul>
  );
}