import { Link } from "@remix-run/react";

import type { Bottle, CollectionBottle, Entity, PagingRel } from "~/types";
import { formatCategoryName } from "../lib/strings";
import BottleName from "./bottleName";
import Button from "./button";
import VintageName from "./vintageName";

type Grouper = undefined | null | Entity;

export default ({
  bottleList,
  groupBy,
  groupTo,
  rel,
}: {
  bottleList: (Bottle | CollectionBottle)[];
  groupBy?: (bottle: Bottle) => Grouper;
  groupTo?: (group: Entity) => string;
  rel?: PagingRel;
}) => {
  let lastGroup: Grouper;
  return (
    <>
      <table className="min-w-full">
        <colgroup>
          <col className="min-w-full sm:w-1/2" />
          <col className="sm:w-1/6" />
          <col className="sm:w-1/6" />
        </colgroup>
        <thead className="hidden border-b border-slate-800 text-sm font-semibold text-slate-500 sm:table-header-group">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left sm:pl-3">
              Bottle
            </th>
            <th
              scope="col"
              className="hidden px-3 py-3.5 text-right sm:table-cell"
            >
              Category
            </th>
            <th
              scope="col"
              className="hidden py-3.5 pl-3 pr-4 text-right sm:table-cell sm:pr-3"
            >
              Age
            </th>
          </tr>
        </thead>
        <tbody>
          {bottleList.map((bottleOrCb) => {
            const bottle =
              "bottle" in bottleOrCb ? bottleOrCb.bottle : bottleOrCb;
            const vintage =
              "bottle" in bottleOrCb
                ? {
                    series: bottle.series,
                    vintageYear: bottleOrCb.vintageYear,
                    barrel: bottleOrCb.barrel,
                  }
                : null;
            const group = groupBy && groupBy(bottle);
            const showGroup = group && group.id !== lastGroup?.id;
            if (group) lastGroup = group;
            return [
              showGroup ? (
                <tr key={`g-${group.id}`} className="border-b border-slate-800">
                  <th
                    colSpan={5}
                    scope="colgroup"
                    className="bg-slate-800 py-2 pl-4 pr-3 text-left text-sm font-semibold sm:pl-3"
                  >
                    {groupTo ? (
                      <Link to={groupTo(group)}>{group.name}</Link>
                    ) : (
                      group.name
                    )}
                  </th>
                </tr>
              ) : null,
              <tr key={bottle.id} className="border-b border-slate-800">
                <td className="max-w-0 py-4 pl-4 pr-3 text-sm sm:pl-3">
                  <Link
                    to={`/bottles/${bottle.id}`}
                    className="font-medium hover:underline"
                  >
                    <BottleName bottle={bottle} />
                  </Link>
                  {vintage && (
                    <div className="font-sm text-light">
                      <VintageName {...vintage} />
                    </div>
                  )}
                </td>
                <td className="hidden px-3 py-4 text-right text-sm sm:table-cell">
                  {!!bottle.category && (
                    <Link
                      to={`/bottles/?category=${bottle.category}`}
                      className="hover:underline"
                    >
                      {formatCategoryName(bottle.category)}
                    </Link>
                  )}
                </td>
                <td className="hidden py-4 pl-3 pr-4 text-right text-sm sm:table-cell sm:pr-3">
                  {bottle.statedAge && (
                    <Link
                      className="hover:underline"
                      to={`/bottles/?age=${bottle.statedAge}`}
                    >{`${bottle.statedAge} years`}</Link>
                  )}
                </td>
              </tr>,
            ];
          })}
        </tbody>
      </table>
      {rel && (
        <nav
          className="flex items-center justify-between py-3"
          aria-label="Pagination"
        >
          <div className="flex flex-1 justify-between gap-x-2 sm:justify-end">
            <Button
              to={rel.prevPage ? `?page=${rel.prevPage}` : undefined}
              disabled={!rel.prevPage}
            >
              Previous
            </Button>
            <Button
              to={rel.nextPage ? `?page=${rel.nextPage}` : undefined}
              disabled={!rel.nextPage}
            >
              Next
            </Button>
          </div>
        </nav>
      )}
    </>
  );
};