import { Menu } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import invariant from "tiny-invariant";

import type { Paginated } from "@peated/shared/types";

import BottleIcon from "~/components/assets/Bottle";
import BottleMetadata from "~/components/bottleMetadata";
import Button from "~/components/button";
import ConfirmationButton from "~/components/confirmationButton";
import { DistributionChart } from "~/components/distributionChart";
import Layout from "~/components/layout";
import QueryBoundary from "~/components/queryBoundary";
import SkeletonButton from "~/components/skeletonButton";
import Tabs from "~/components/tabs";
import TimeSince from "~/components/timeSince";
import useApi from "~/hooks/useApi";
import useAuth from "~/hooks/useAuth";
import { logError } from "~/lib/log";
import { formatCategoryName } from "~/lib/strings";
import type { Bottle, Collection, StorePrice } from "~/types";

type BottleWithStats = Bottle & {
  tastings: number;
  avgRating: number;
  people: number;
};

const CollectionAction = ({ bottle }: { bottle: Bottle }) => {
  const api = useApi();

  const { data } = useQuery(
    ["bottles", bottle.id, "collections"],
    (): Promise<Paginated<Collection>> =>
      api.get(`/users/me/collections`, {
        query: {
          bottle: bottle.id,
        },
      }),
  );

  if (!data) return null;

  const { results: collectionList } = data;

  const [isCollected, setIsCollected] = useState(collectionList.length > 0);
  const [loading, setLoading] = useState(false);

  const collect = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (isCollected) {
        await api.delete(`/users/me/collections/default/bottles/${bottle.id}`);
        setIsCollected(false);
      } else {
        await api.post("/users/me/collections/default/bottles", {
          data: {
            bottle: bottle.id,
          },
        });
        setIsCollected(true);
      }
    } catch (err: any) {
      logError(err);
    }
    setLoading(false);
  };

  return (
    <>
      <Button onClick={collect} disabled={loading}>
        {isCollected ? "Remove from Collection" : "Add to Collection"}
      </Button>
    </>
  );
};

type Tag = { tag: string; count: number };

const BottleTagDistribution = ({ bottleId }: { bottleId: number }) => {
  const api = useApi();

  const { data } = useQuery(
    ["bottles", bottleId, "tags"],
    (): Promise<Paginated<Tag> & { totalCount: number }> =>
      api.get(`/bottles/${bottleId}/tags`),
  );

  if (!data) return null;

  const { results, totalCount } = data;

  if (!results.length) return null;

  return (
    <DistributionChart
      items={results.map((t) => ({
        name: t.tag,
        count: t.count,
        tag: t.tag,
      }))}
      totalCount={totalCount}
      to={(item) => `/bottles?tag=${encodeURIComponent(item.name)}`}
    />
  );
};

export async function loader({ params, context }: LoaderArgs) {
  invariant(params.bottleId);

  const bottle: BottleWithStats = await context.api.get(
    `/bottles/${params.bottleId}`,
  );

  return json({ bottle });
}

export const meta: V2_MetaFunction = ({ data: { bottle } }) => {
  return [
    {
      title: bottle.fullName,
    },
  ];
};

export default function BottleDetails() {
  const { user } = useAuth();
  const api = useApi();
  const navigate = useNavigate();

  const { bottle } = useLoaderData<typeof loader>();

  const stats = [
    {
      name: "Avg Rating",
      value: Math.round(bottle.avgRating * 100) / 100,
    },
    { name: "Tastings", value: bottle.tastings.toLocaleString() },
    { name: "People", value: bottle.people.toLocaleString() },
  ];

  const deleteBottle = async () => {
    // TODO: show confirmation message
    await api.delete(`/bottles/${bottle.id}`);
    navigate("/");
  };

  return (
    <Layout>
      <div className="p-3 sm:py-0">
        <div className="my-4 flex min-w-full flex-wrap gap-x-3 gap-y-4 sm:flex-nowrap">
          <BottleIcon className="hidden h-14 w-auto sm:inline-block" />
          <div className="w-full flex-1 flex-col items-center sm:w-auto sm:items-start">
            <h1
              className="mx-auto max-w-[260px] truncate text-center text-3xl font-semibold sm:mx-0 sm:max-w-[480px] sm:text-left"
              title={bottle.fullName}
            >
              {bottle.name}
            </h1>
            <BottleMetadata
              data={bottle}
              className="text-center text-sm text-slate-500 sm:text-left"
            />
          </div>

          {(bottle.category || bottle.statedAge) && (
            <div className="flex w-full flex-col items-center justify-center gap-x-1 text-sm text-slate-500 sm:w-auto sm:items-end">
              <p>
                {bottle.category && (
                  <Link
                    to={`/bottles?category=${encodeURIComponent(
                      bottle.category,
                    )}`}
                  >
                    {formatCategoryName(bottle.category)}
                  </Link>
                )}
              </p>
              <p>
                {bottle.statedAge ? `Aged ${bottle.statedAge} years` : null}
              </p>
            </div>
          )}
        </div>

        <div className="my-8 flex justify-center gap-4 sm:justify-start">
          <Button to={`/bottles/${bottle.id}/addTasting`} color="primary">
            Record a Tasting
          </Button>
          {user && (
            <QueryBoundary loading={<SkeletonButton />} fallback={() => null}>
              <CollectionAction bottle={bottle} />
            </QueryBoundary>
          )}

          {user?.mod && (
            <Menu as="div" className="menu">
              <Menu.Button as={Button}>
                <EllipsisVerticalIcon className="h-5 w-5" />
              </Menu.Button>
              <Menu.Items
                className="absolute right-0 z-10 mt-2 w-64 origin-top-right"
                unmount={false}
              >
                <Menu.Item as={Link} to={`/bottles/${bottle.id}/edit`}>
                  Edit Bottle
                </Menu.Item>
                {user.admin && (
                  <Menu.Item as={ConfirmationButton} onContinue={deleteBottle}>
                    Delete Bottle
                  </Menu.Item>
                )}
              </Menu.Items>
            </Menu>
          )}
        </div>

        <QueryBoundary
          fallback={
            <div
              className="mb-4 animate-pulse bg-slate-800"
              style={{ height: 200 }}
            />
          }
          loading={<Fragment />}
        >
          <BottleTagDistribution bottleId={bottle.id} />
        </QueryBoundary>

        <div className="my-6 grid grid-cols-3 items-center gap-3 text-center sm:text-left">
          {stats.map((stat) => (
            <div key={stat.name}>
              <p className="text-peated-light leading-7">{stat.name}</p>
              <p className="order-first text-3xl font-semibold tracking-tight sm:text-5xl">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex">
        <div className="flex-1">
          <div className="border-b border-slate-700">
            <Tabs fullWidth>
              <Tabs.Item to={`/bottles/${bottle.id}`} controlled>
                Activity
              </Tabs.Item>
            </Tabs>
          </div>
          <QueryBoundary>
            <Outlet context={{ bottle }} />
          </QueryBoundary>

          {bottle.createdBy && (
            <p className="mt-8 text-center text-sm text-slate-500 sm:text-left">
              This bottle was first added by{" "}
              <Link
                to={`/users/${bottle.createdBy.username}`}
                className="font-medium hover:underline"
              >
                {bottle.createdBy.displayName}
              </Link>{" "}
              <TimeSince date={bottle.createdAt} />
            </p>
          )}
        </div>
        <div className="ml-4 hidden w-[200px] sm:block">
          <QueryBoundary loading={<BottlePricesSkeleton />}>
            <BottlePrices bottleId={bottle.id} />
          </QueryBoundary>
        </div>
      </div>
    </Layout>
  );
}

function BottlePricesSkeleton() {
  return (
    <div>
      <Tabs fullWidth>
        <Tabs.Item active>Prices</Tabs.Item>
      </Tabs>
      <div
        className="mt-4 animate-pulse bg-slate-800"
        style={{ height: 200 }}
      />
    </div>
  );
}

function BottlePrices({ bottleId }: { bottleId: number }) {
  const api = useApi();
  const { data } = useQuery(
    ["bottles", bottleId, "prices"],
    (): Promise<Paginated<StorePrice>> =>
      api.get(`/bottles/${bottleId}/prices`),
  );

  if (!data) return null;

  return (
    <div>
      <Tabs fullWidth>
        <Tabs.Item active>Prices</Tabs.Item>
      </Tabs>
      {data.results.length ? (
        <ul className="mt-4 space-y-2 text-sm">
          {data.results.map((price) => {
            return (
              <li key={price.store?.id}>
                <a href={price.url} className="flex hover:underline">
                  <span className="flex-1">{price.store?.name}</span>
                  <span>${(price.price / 100).toFixed(2)}</span>
                </a>
                <span className="text-light text-xs">
                  <TimeSince date={price.updatedAt} />
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 text-center text-sm">No sellers found.</p>
      )}
    </div>
  );
}