import type { Context as BaseContext, Hono } from 'hono';
import type { Config } from '../config/config.types';
import type { TrackingServices } from '../tracking/tracking.services';
import type { Auth } from './auth/auth.services';
import type { Database } from './database/database.types';
import type { EventsServices } from './events/events.services';

export type ServerInstanceGenerics = {
  Variables: {
    config: Config;
    db: Database;
    auth: Auth;
    user: Auth['$Infer']['Session']['user'] | null;
    session: Auth['$Infer']['Session']['session'] | null;
    trackingServices?: TrackingServices;
    eventsServices?: EventsServices;
  };
};

export type Context = BaseContext<ServerInstanceGenerics>;

export type ServerInstance = Hono<ServerInstanceGenerics>;
