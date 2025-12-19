/**
 * Branded types for type-safe IDs
 *
 * These prevent accidentally mixing up different ID types at compile time.
 * Example: assignHaunt(userId, orgId) would be a compile error
 */

declare const brand: unique symbol;
type Brand<T, TBrand extends string> = T & { [brand]: TBrand };

// Core entity IDs
export type UserId = Brand<string, 'UserId'>;
export type OrgId = Brand<string, 'OrgId'>;
export type HauntId = Brand<string, 'HauntId'>;

// Staff and membership IDs
export type StaffId = Brand<string, 'StaffId'>;
export type MembershipId = Brand<string, 'MembershipId'>;

// Ticketing IDs
export type TicketId = Brand<string, 'TicketId'>;
export type OrderId = Brand<string, 'OrderId'>;
export type ProductId = Brand<string, 'ProductId'>;

// Scheduling IDs
export type ShiftId = Brand<string, 'ShiftId'>;
export type ScheduleId = Brand<string, 'ScheduleId'>;

// Payment IDs
export type PaymentId = Brand<string, 'PaymentId'>;
export type RefundId = Brand<string, 'RefundId'>;

// Helper functions to create branded IDs
export const createUserId = (id: string): UserId => id as UserId;
export const createOrgId = (id: string): OrgId => id as OrgId;
export const createHauntId = (id: string): HauntId => id as HauntId;
export const createStaffId = (id: string): StaffId => id as StaffId;
export const createMembershipId = (id: string): MembershipId => id as MembershipId;
export const createTicketId = (id: string): TicketId => id as TicketId;
export const createOrderId = (id: string): OrderId => id as OrderId;
export const createProductId = (id: string): ProductId => id as ProductId;
export const createShiftId = (id: string): ShiftId => id as ShiftId;
export const createScheduleId = (id: string): ScheduleId => id as ScheduleId;
export const createPaymentId = (id: string): PaymentId => id as PaymentId;
export const createRefundId = (id: string): RefundId => id as RefundId;
