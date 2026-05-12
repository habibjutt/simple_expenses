import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AdminSectionCardsProps {
  stats?: {
    userCount: number;
    activeSubscriptions: number;
    totalTransactions: number;
    bannedCount: number;
  };
}

export function AdminSectionCards({ stats }: AdminSectionCardsProps) {
  const userCount = stats?.userCount ?? 0;
  const activeSubscriptions = stats?.activeSubscriptions ?? 0;
  const totalTransactions = stats?.totalTransactions ?? 0;
  const bannedCount = stats?.bannedCount ?? 0;
  const conversionRate =
    userCount > 0 ? ((activeSubscriptions / userCount) * 100).toFixed(1) : null;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card border border-border shadow-none">
        <CardHeader>
          <CardDescription className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Total Users</CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums text-foreground @[250px]/card:text-4xl">
            {userCount.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="secondary" className="text-xs">
              <IconTrendingUp className="size-3" />
              Live
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex gap-2 font-medium text-foreground">
            Registered accounts <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground text-xs">All-time user count</div>
        </CardFooter>
      </Card>

      <Card className="@container/card border border-border shadow-none">
        <CardHeader>
          <CardDescription className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Active Subscriptions</CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums text-foreground @[250px]/card:text-4xl">
            {activeSubscriptions.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="secondary" className="text-xs">
              <IconTrendingUp className="size-3" />
              Live
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex gap-2 font-medium text-foreground">
            Active paying subscribers <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground text-xs">
            Current active subscriptions
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card border border-border shadow-none">
        <CardHeader>
          <CardDescription className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Total Transactions</CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums text-foreground @[250px]/card:text-4xl">
            {totalTransactions.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="secondary" className="text-xs">
              <IconTrendingUp className="size-3" />
              Live
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex gap-2 font-medium text-foreground">
            All recorded transactions <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground text-xs">Across all accounts</div>
        </CardFooter>
      </Card>

      <Card className="@container/card border border-border shadow-none">
        <CardHeader>
          <CardDescription className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Conversion Rate</CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums text-foreground @[250px]/card:text-4xl">
            {conversionRate !== null ? `${conversionRate}%` : "N/A"}
          </CardTitle>
          <CardAction>
            <Badge variant={bannedCount > 0 ? "destructive" : "secondary"} className="text-xs">
              {bannedCount > 0 ? (
                <>
                  <IconTrendingDown className="size-3" />
                  Watch
                </>
              ) : (
                <>
                  <IconTrendingUp className="size-3" />
                  Healthy
                </>
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex gap-2 font-medium text-foreground">
            Active subs / total users <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground text-xs">
            {bannedCount} banned account{bannedCount !== 1 ? "s" : ""}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
