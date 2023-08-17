import { fetchAPI } from "apps/utils/fetch.ts";
import { AppContext } from "apps/vtex/mod.ts";
import type { WishlistItem } from "apps/vtex/utils/types.ts";
import wishlistLoader from "apps/vtex/loaders/wishlist.ts";
import { paths } from "apps/vtex/utils/paths.ts";
import { parseCookie } from "apps/vtex/utils/vtexId.ts";

export type Props = { id: string };

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<WishlistItem[]> => {
  const { cookie, payload } = parseCookie(req.headers, ctx.account);
  const user = payload?.sub;
  const { id } = props;

  if (!user) {
    return [];
  }

  await fetchAPI(
    `${paths(ctx).api.io._v.private.graphql.v1}`,
    {
      method: "POST",
      body: JSON.stringify({
        operationName: "RemoveFromList",
        variables: {
          name: "Wishlist",
          shopperId: user,
          id,
        },
        query:
          `mutation RemoveFromList($id: ID!, $shopperId: String!, $name: String) { removeFromList(id: $id, shopperId: $shopperId, name: $name) @context(provider: "vtex.wish-list@1.x") }`,
      }),
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        cookie,
      },
    },
  );

  return wishlistLoader({ count: Infinity }, req, ctx);
};

export default action;