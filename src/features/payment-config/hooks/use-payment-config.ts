"use client";

import { useSyncExternalStore } from "react";

export const PAYMENT_METHOD_TYPES = ["gcash", "maya", "bank"] as const;

export type PaymentMethodType = (typeof PAYMENT_METHOD_TYPES)[number];

export interface PaymentMethodConfig {
  id: string;
  type: PaymentMethodType;
  accountName: string;
  accountNumber: string;
  bankName?: string;
  isDefault: boolean;
}

export interface PaymentMethodInput {
  type: PaymentMethodType;
  accountName: string;
  accountNumber: string;
  bankName?: string;
  isDefault?: boolean;
}

interface PaymentConfigState {
  methods: PaymentMethodConfig[];
}

const INITIAL_STATE: PaymentConfigState = {
  methods: [
    {
      id: "pm-gcash",
      type: "gcash",
      accountName: "Cravings PH",
      accountNumber: "0917 123 4567",
      isDefault: true,
    },
    {
      id: "pm-maya",
      type: "maya",
      accountName: "Cravings PH",
      accountNumber: "0918 765 4321",
      isDefault: false,
    },
    {
      id: "pm-bank",
      type: "bank",
      accountName: "Cravings PH Inc.",
      accountNumber: "1234 5678 9012",
      bankName: "BDO",
      isDefault: false,
    },
  ],
};

let store: PaymentConfigState = INITIAL_STATE;

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function getSnapshot() {
  return store;
}

function setStore(next: PaymentConfigState) {
  store = next;
  emitChange();
}

function createMethodId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `pm-${Date.now()}`;
}

function sanitizeMethodInput(input: PaymentMethodInput) {
  return {
    type: input.type,
    accountName: input.accountName.trim(),
    accountNumber: input.accountNumber.trim(),
    bankName:
      input.type === "bank" ? input.bankName?.trim() || undefined : undefined,
    isDefault: input.isDefault ?? false,
  } satisfies PaymentMethodInput;
}

function normalizeDefaultMethod(
  methods: PaymentMethodConfig[],
  preferredDefaultId?: string,
) {
  if (methods.length === 0) {
    return [];
  }

  const nextDefaultId =
    preferredDefaultId &&
    methods.some((method) => method.id === preferredDefaultId)
      ? preferredDefaultId
      : (methods.find((method) => method.isDefault)?.id ?? methods[0]?.id);

  return methods.map((method) => ({
    ...method,
    isDefault: method.id === nextDefaultId,
  }));
}

export function usePaymentConfig() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  function addMethod(input: PaymentMethodInput) {
    const nextMethod = sanitizeMethodInput(input);
    const methodId = createMethodId();
    const methods = [
      ...store.methods,
      {
        id: methodId,
        ...nextMethod,
      },
    ];

    setStore({
      methods: normalizeDefaultMethod(
        methods,
        nextMethod.isDefault ? methodId : undefined,
      ),
    });
  }

  function updateMethod(methodId: string, input: PaymentMethodInput) {
    const nextMethod = sanitizeMethodInput(input);
    const methods = store.methods.map((method) =>
      method.id === methodId ? { ...method, ...nextMethod } : method,
    );

    setStore({
      methods: normalizeDefaultMethod(
        methods,
        nextMethod.isDefault ? methodId : undefined,
      ),
    });
  }

  function removeMethod(methodId: string) {
    const methods = store.methods.filter((method) => method.id !== methodId);
    setStore({ methods: normalizeDefaultMethod(methods) });
  }

  function setDefaultMethod(methodId: string) {
    setStore({
      methods: normalizeDefaultMethod(store.methods, methodId),
    });
  }

  return {
    methods: snapshot.methods,
    totalMethods: snapshot.methods.length,
    defaultMethod:
      snapshot.methods.find((method) => method.isDefault) ??
      snapshot.methods[0],
    addMethod,
    updateMethod,
    removeMethod,
    setDefaultMethod,
  };
}
