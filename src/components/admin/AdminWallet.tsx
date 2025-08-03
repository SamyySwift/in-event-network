
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdminWallet } from '@/hooks/useAdminWallet';
import { useAdminWithdrawals } from '@/hooks/useAdminWithdrawals';
import { WithdrawalButton } from './WithdrawalButton';
import { Wallet, TrendingUp, Download, Clock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export const AdminWallet: React.FC = () => {
  const { wallet, isLoading, createWallet, hasWallet } = useAdminWallet();
  const { withdrawalHistory, isLoadingHistory } = useAdminWithdrawals();

  if (isLoading) {
    return (
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="animate-pulse bg-muted rounded h-12 w-12"></div>
              <div className="space-y-2">
                <div className="animate-pulse bg-muted rounded h-4 w-32"></div>
                <div className="animate-pulse bg-muted rounded h-6 w-24"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasWallet) {
    return (
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Event Wallet
            </CardTitle>
            <CardDescription>
              Create a wallet to track your event earnings and manage withdrawals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => createWallet.mutate()}>
              Create Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Line 57 - Fix minimum withdrawal calculation:
  const canWithdraw = (wallet?.available_balance || 0) >= (wallet?.minimum_payout_amount || 1000);

  return (
    <div className="grid gap-6">
      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            // In AdminWallet component, remove the division by 100:
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(wallet?.available_balance || 0)}
            </div>
            
            // Also fix other wallet amount displays:
            <div className="text-2xl font-bold">
              {formatCurrency(wallet?.total_earnings || 0)}
            </div>
            
            <div className="text-2xl font-bold">
              {formatCurrency(wallet?.withdrawn_amount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency((wallet?.total_earnings || 0) / 100)}
            </div>
            <p className="text-xs text-muted-foreground">
              From ticket sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency((wallet?.withdrawn_amount || 0) / 100)}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully withdrawn
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Section */}
      <Card>
        <CardHeader>
          <CardTitle>Withdraw Funds</CardTitle>
          <CardDescription>
            Transfer your earnings to your bank account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canWithdraw && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              // Lines 115-119 - Fix alert message:
              <AlertDescription>
                Minimum withdrawal amount is {formatCurrency(wallet?.minimum_payout_amount || 1000)}.
                Current balance: {formatCurrency(wallet?.available_balance || 0)}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Bank Account:</span>
              <span className="font-medium">
                {wallet?.is_bank_verified ? (
                  <Badge variant="secondary" className="text-green-600">
                    {wallet.account_name} - {wallet.bank_name}
                  </Badge>
                ) : (
                  <Badge variant="outline">Not verified</Badge>
                )}
              </span>
            </div>
            
            {wallet?.last_payout_at && (
              <div className="flex justify-between text-sm">
                <span>Last Withdrawal:</span>
                <span className="font-medium">
                  {new Date(wallet.last_payout_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          <WithdrawalButton
            walletId={wallet?.id || ''}
            availableBalance={wallet?.available_balance || 0}
            totalWithdrawn={wallet?.withdrawn_amount || 0}
            bankName={wallet?.bank_name || undefined}
            accountNumber={wallet?.account_number || undefined}
            accountName={wallet?.account_name || undefined}
            recipientCode={wallet?.recipient_code || undefined}
            isBankVerified={wallet?.is_bank_verified || false}
          />
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
          <CardDescription>
            Track your past withdrawals and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-muted rounded h-16"></div>
              ))}
            </div>
          ) : withdrawalHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2" />
              No withdrawals yet
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawalHistory.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="font-medium">
                      {formatCurrency(withdrawal.amount_naira || withdrawal.amount / 100)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {withdrawal.bank_name} - {withdrawal.account_number}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(withdrawal.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        withdrawal.status === 'completed'
                          ? 'default'
                          : withdrawal.status === 'failed'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {withdrawal.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
