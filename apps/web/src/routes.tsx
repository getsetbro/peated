import type { RouteObject } from "react-router-dom";

import ErrorPage from "./error-page";
import Activity, { loader as activityLoader } from "./routes/activity";
import AddBottle from "./routes/addBottle";
import AddTasting, { loader as addTastingLoader } from "./routes/addTasting";
import BottleDetails, {
  loader as bottleDetailsLoader,
} from "./routes/bottleDetails";
import BottleList, { loader as bottleListLoader } from "./routes/bottles";
import BrandDetails, {
  loader as brandDetailsLoader,
} from "./routes/brandDetails";
import BrandList, { loader as brandListLoader } from "./routes/brands";
import DistillerDetails, {
  loader as distillerDetailsLoader,
} from "./routes/distillerDetails";
import DistillerList, {
  loader as distillerListLoader,
} from "./routes/distillers";
import EditBottle, { loader as editBottleLoader } from "./routes/editBottle";
import Friends, { loader as friendsLoader } from "./routes/friends";
import Login from "./routes/login";
import Root from "./routes/root";
import Search from "./routes/search";
import Settings, { loader as settingsLoader } from "./routes/settings";
import UserDetails, { loader as userDetailsLoader } from "./routes/userDetails";

export default function createRoutes() {
  return [
    {
      path: "/",
      element: <Root />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <Activity />, loader: activityLoader },
        {
          path: "addBottle",
          element: <AddBottle />,
        },
        {
          path: "bottles/:bottleId",
          element: <BottleDetails />,
          loader: bottleDetailsLoader,
        },
        {
          path: "bottles/:bottleId/addTasting",
          element: <AddTasting />,
          loader: addTastingLoader,
        },
        {
          path: "bottles/",
          element: <BottleList />,
          loader: bottleListLoader,
        },
        {
          path: "bottles/:bottleId/edit",
          element: <EditBottle />,
          loader: editBottleLoader,
        },
        {
          path: "brands",
          element: <BrandList />,
          loader: brandListLoader,
        },

        {
          path: "brands/:brandId",
          element: <BrandDetails />,
          loader: brandDetailsLoader,
        },
        {
          path: "distillers",
          element: <DistillerList />,
          loader: distillerListLoader,
        },
        {
          path: "distillers/:distillerId",
          element: <DistillerDetails />,
          loader: distillerDetailsLoader,
        },
        {
          path: "friends",
          element: <Friends />,
          loader: friendsLoader,
        },
        {
          path: "search",
          element: <Search />,
        },
        {
          path: "settings",
          element: <Settings />,
          loader: settingsLoader,
        },
        {
          path: "users/:userId",
          element: <UserDetails />,
          loader: userDetailsLoader,
        },
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },
  ] as RouteObject[];
}
