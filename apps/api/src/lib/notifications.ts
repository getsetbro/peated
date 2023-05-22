import { and, eq } from "drizzle-orm";
import { AnyPgTable } from "drizzle-orm/pg-core";
import { DatabaseType, TransactionType } from "../db";
import {
  NewNotification,
  Notification,
  bottles,
  comments,
  entities,
  follows,
  notifications,
  tastings,
  toasts,
} from "../db/schema";

export const objectTypeFromSchema = (schema: AnyPgTable) => {
  switch (schema) {
    case bottles:
      return "bottle";
    case comments:
      return "comment";
    case entities:
      return "entity";
    case follows:
      return "follow";
    case toasts:
      return "toast";
    case tastings:
      return "tasting";
    default:
      throw new Error("Invalid schema");
  }
};

export const createNotification = async (
  db: DatabaseType | TransactionType,
  notification: NewNotification,
) => {
  if (notification.userId === notification.fromUserId) {
    throw new Error(
      "You should not create notifications to and from the same user.",
    );
  }
  const [notif] = await db
    .insert(notifications)
    .values(notification)
    .onConflictDoNothing()
    .returning();
  return notif;
};

export const deleteNotification = async (
  db: DatabaseType | TransactionType,
  {
    objectType,
    objectId,
    userId,
  }: Pick<Notification, "objectType" | "objectId" | "userId">,
) => {
  await db
    .delete(notifications)
    .where(
      and(
        eq(notifications.objectType, objectType),
        eq(notifications.objectId, objectId),
        eq(notifications.userId, userId),
      ),
    );
};
