"use client";

import { LogIn, LogOut, ShieldCheck } from "lucide-react";
import clsx from "clsx";
import type { FormEvent } from "react";
import type { User, UserRole } from "@/lib/types";

type AppHeaderProps = {
  authMessage: string;
  email: string;
  isRoleLocked: boolean;
  password: string;
  role: UserRole;
  sellerId: string;
  users: User[];
  onEmailChange: (email: string) => void;
  onLogout?: () => void;
  onPasswordChange: (password: string) => void;
  onRoleChange: (role: UserRole) => void;
  onSellerChange: (sellerId: string) => void;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
};

export function AppHeader({
  authMessage,
  email,
  isRoleLocked,
  password,
  role,
  sellerId,
  users,
  onEmailChange,
  onLogout,
  onPasswordChange,
  onRoleChange,
  onSellerChange,
  onLogin
}: AppHeaderProps) {
  const selectedUser = users.find((user) => user.id === sellerId);
  const sellerOptions = users.filter((user) => user.role === "vendedor");
  const visibleSellerOptions =
    selectedUser && !sellerOptions.some((user) => user.id === selectedUser.id)
      ? [selectedUser, ...sellerOptions]
      : sellerOptions;

  return (
    <header className="border-b border-black/10 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-ink text-white">
            <ShieldCheck aria-hidden className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-coral">Ketri Criativa</p>
            <h1 className="text-xl font-bold tracking-normal text-ink">
              Sistema Comercial Pets e tal
            </h1>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form className="grid gap-2 sm:grid-cols-[190px_150px_auto]" onSubmit={onLogin}>
            <input
              className="h-10 rounded-lg border border-black/10 bg-white px-3 text-sm"
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              aria-label="Email"
            />
            <input
              className="h-10 rounded-lg border border-black/10 bg-white px-3 text-sm"
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="Senha"
              aria-label="Senha"
            />
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-leaf px-3 text-sm font-semibold text-white">
              <LogIn aria-hidden className="h-4 w-4" />
              Entrar
            </button>
          </form>

          {onLogout && (
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-black/10 px-3 text-sm font-semibold text-ink"
              onClick={onLogout}
              type="button"
            >
              <LogOut aria-hidden className="h-4 w-4" />
              Sair
            </button>
          )}

          <div className="flex rounded-lg border border-black/10 bg-paper p-1">
            <button
              className={clsx(
                "rounded-md px-3 py-2 text-sm font-semibold",
                isRoleLocked && "cursor-not-allowed opacity-60",
                role === "admin" ? "bg-ink text-white" : "text-ink/70"
              )}
              disabled={isRoleLocked}
              onClick={() => onRoleChange("admin")}
            >
              Admin
            </button>
            <button
              className={clsx(
                "rounded-md px-3 py-2 text-sm font-semibold",
                isRoleLocked && "cursor-not-allowed opacity-60",
                role === "vendedor" ? "bg-ink text-white" : "text-ink/70"
              )}
              disabled={isRoleLocked}
              onClick={() => onRoleChange("vendedor")}
            >
              Vendedor
            </button>
          </div>

          <select
            className="h-10 rounded-lg border border-black/10 bg-white px-3 text-sm font-medium text-ink disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isRoleLocked || role === "admin"}
            value={sellerId}
            onChange={(event) => onSellerChange(event.target.value)}
            aria-label="Vendedor atual"
          >
            {visibleSellerOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-3 text-xs font-medium text-ink/55 sm:px-6 lg:px-8">
        {authMessage}
      </div>
    </header>
  );
}