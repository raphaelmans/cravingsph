"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export const PAYMENT_METHOD_TYPES = ["gcash", "maya", "bank"] as const;

export type PaymentMethodType = (typeof PAYMENT_METHOD_TYPES)[number];

export interface PaymentMethodConfig {
  id: string;
  type: PaymentMethodType;
  accountName: string;
  accountNumber: string;
  bankName: string | null;
  isDefault: boolean;
}

export interface PaymentMethodInput {
  type: PaymentMethodType;
  accountName: string;
  accountNumber: string;
  bankName?: string;
  isDefault?: boolean;
}

export function usePaymentConfig() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const listQuery = useQuery(trpc.paymentConfig.list.queryOptions());

  const invalidateList = () => {
    queryClient.invalidateQueries({
      queryKey: trpc.paymentConfig.list.queryKey(),
    });
  };

  const addMutation = useMutation(
    trpc.paymentConfig.add.mutationOptions({
      onSuccess: invalidateList,
    }),
  );

  const updateMutation = useMutation(
    trpc.paymentConfig.update.mutationOptions({
      onSuccess: invalidateList,
    }),
  );

  const removeMutation = useMutation(
    trpc.paymentConfig.remove.mutationOptions({
      onSuccess: invalidateList,
    }),
  );

  const setDefaultMutation = useMutation(
    trpc.paymentConfig.setDefault.mutationOptions({
      onSuccess: invalidateList,
    }),
  );

  const methods: PaymentMethodConfig[] = (listQuery.data ?? []).map((m) => ({
    id: m.id,
    type: m.type as PaymentMethodType,
    accountName: m.accountName,
    accountNumber: m.accountNumber,
    bankName: m.bankName,
    isDefault: m.isDefault,
  }));

  function addMethod(input: PaymentMethodInput) {
    addMutation.mutate({
      type: input.type,
      accountName: input.accountName,
      accountNumber: input.accountNumber,
      bankName: input.type === "bank" ? input.bankName : undefined,
      isDefault: input.isDefault ?? false,
    });
  }

  function updateMethod(methodId: string, input: PaymentMethodInput) {
    updateMutation.mutate({
      id: methodId,
      type: input.type,
      accountName: input.accountName,
      accountNumber: input.accountNumber,
      bankName: input.type === "bank" ? input.bankName : undefined,
      isDefault: input.isDefault ?? false,
    });
  }

  function removeMethod(methodId: string) {
    removeMutation.mutate({ id: methodId });
  }

  function setDefaultMethod(methodId: string) {
    setDefaultMutation.mutate({ id: methodId });
  }

  return {
    methods,
    totalMethods: methods.length,
    defaultMethod: methods.find((m) => m.isDefault) ?? methods[0],
    addMethod,
    updateMethod,
    removeMethod,
    setDefaultMethod,
    isLoading: listQuery.isLoading,
  };
}
