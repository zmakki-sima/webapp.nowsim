import { z } from "zod";

const currencySchema = z.enum(["EUR", "USD"]);

const numeric = z.coerce.number();

const csv = z
  .string()
  .default("")
  .transform((value) =>
    value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
  );

const planSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  days: numeric,
  data: z.string().default(""),
  countries_included: csv,
  countryIso2: csv,
  iso3: csv,
  mcc: csv,
  operators: csv,
  image: z.string().default(""),
  apn: z.string().optional(),
  plan_type: z.enum(["country", "region"]),
  price: numeric,
  retail_price: numeric,
  currency: currencySchema,
  data_unit: z.string().default("GB"),
  old_id: z.string().nullable().optional(),
});

export type ApiPlan = z.infer<typeof planSchema>;

export const plansResponseSchema = z.union([
  z.array(planSchema),
  z.object({ plans: z.array(planSchema) }).transform((body) => body.plans),
  z.object({ data: z.array(planSchema) }).transform((body) => body.data),
]);

const deviceTypeSchema = z.object({
  type: z.string().min(1),
  brands: z.array(
    z.object({
      brand: z.string().min(1),
      models: z.array(z.object({ model: z.string().min(1) })),
    }),
  ),
});

export type ApiDeviceType = z.infer<typeof deviceTypeSchema>;

export const newUserResponseSchema = z.object({
  user_id: z.union([z.string(), z.number()]).transform(String),
  email: z.string().min(1),
  alreadyExist: numeric.optional(),
});

const id = z.union([z.string(), z.number()]).transform(String);

const esimSchema = z.object({
  id,
  iccid: z.string().default(""),
  created_at: z.string().nullish(),
  active_plan_id: id.nullish(),
  plan_activated_at: z.string().nullish(),
  plan_expired_at: z.string().nullish(),
  qrcode: z.string().nullish(),
  status_qr: z.string().nullish(),
  is_deleted: z.union([z.string(), z.number()]).nullish(),
  img: z.string().nullish(),
  data_left_mb: numeric.nullish(),
  data_package_mb: numeric.nullish(),
  data_used_mb: numeric.nullish(),
  ios_tap_link: z.string().nullish(),
  networkinfo: z
    .object({
      time: z.string().nullish(),
      lastRat: z.string().nullish(),
    })
    .nullish(),
});

export type ApiEsim = z.infer<typeof esimSchema>;

export const userResponseSchema = z.object({
  id,
  email: z.string().default(""),
  created_at: z.string().nullish(),
  esim_change_count: numeric.nullish(),
  esims: z.array(esimSchema).default([]),
});

const orderSchema = z.object({
  id,
  user_id: id.nullish(),
  iccid: z.string().default(""),
  plan_id: id.nullish(),
  cost_eur: numeric.nullish(),
  created_at: z.string().nullish(),
  payment_id: id.nullish(),
});

export type ApiOrder = z.infer<typeof orderSchema>;

export const ordersResponseSchema = z.union([
  z.array(orderSchema),
  z.object({ orders: z.array(orderSchema) }).transform((body) => body.orders),
  z.object({ data: z.array(orderSchema) }).transform((body) => body.data),
]);

export const supportedDevicesResponseSchema = z.union([
  z.array(deviceTypeSchema),
  z
    .object({ devices: z.array(deviceTypeSchema) })
    .transform((body) => body.devices),
  z.object({ data: z.array(deviceTypeSchema) }).transform((body) => body.data),
]);
